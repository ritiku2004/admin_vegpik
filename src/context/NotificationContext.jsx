import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { requestForToken, onMessageListener } from '../services/firebaseClient';
import api from '../api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [alertMessage, setAlertMessage] = useState(null);
  const [newOrdersQueue, setNewOrdersQueue] = useState([]);
  const [shopBadgeCounts, setShopBadgeCounts] = useState({}); // { shopId: count }
  const seenOrderIdsRef = useRef(new Set());

  const newOrderInfo = newOrdersQueue[0] || null;
  const setNewOrderInfo = (val) => {
    if (val === null) {
      setNewOrdersQueue(prev => prev.slice(1));
    }
  };

  const acceptOrderById = async (orderId) => {
    const order = newOrdersQueue.find(o => parseInt(o.orderId) === parseInt(orderId));
    if (!order) return;
    try {
      await api.put(`/orders/${orderId}`, {
        status: 'Processing',
        payment_status: order.paymentStatus
      });
      setNewOrdersQueue(prev => prev.filter(o => parseInt(o.orderId) !== parseInt(orderId)));
    } catch (err) {
      console.error('Failed to accept order:', err);
      alert('Failed to accept order: ' + (err.response?.data?.error || err.message));
    }
  };

  const dismissOrderById = (orderId) => {
    setNewOrdersQueue(prev => prev.filter(o => parseInt(o.orderId) !== parseInt(orderId)));
  };

  const acceptCurrentNewOrder = async () => {
    if (newOrderInfo) {
      await acceptOrderById(newOrderInfo.orderId);
    }
  };

  const audioRef = useRef(null);

  useEffect(() => {
    // Preload audio and bind user interaction to unlock autoplay blocks
    const audio = new Audio('/New order recieved.mp3');
    audio.load();
    audioRef.current = audio;

    const unlockAudio = () => {
      audio.play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          console.log('[NotificationContext] Audio autoplay unlocked successfully!');
          window.removeEventListener('click', unlockAudio);
          window.removeEventListener('keydown', unlockAudio);
          window.removeEventListener('touchstart', unlockAudio);
        })
        .catch(err => {
          console.warn('[NotificationContext] Failed to unlock audio:', err);
        });
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const playNotificationSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => {
          console.warn('Preloaded audio playback blocked:', e);
          const fallbackAudio = new Audio('/New order recieved.mp3');
          fallbackAudio.play().catch(err => console.warn('Fallback audio playback blocked:', err));
        });
      } else {
        const audio = new Audio('/New order recieved.mp3');
        audio.play().catch(e => console.warn('Direct audio playback blocked:', e));
      }
    } catch (e) {
      console.warn('Audio playback failed or blocked:', e);
    }
  };

  useEffect(() => {
    // Request permission and register token
    requestForToken();

    // Populate seen orders on startup
    const initSeenOrders = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;
        const { data } = await api.get('/orders');
        if (data.success && Array.isArray(data.data)) {
          data.data.forEach(order => {
            seenOrderIdsRef.current.add(String(order.id));
          });
          console.log('[NotificationContext] Pre-populated seen orders count:', seenOrderIdsRef.current.size);
        }
      } catch (err) {
        console.error('Failed to pre-populate seen orders:', err);
      }
    };
    initSeenOrders();

    // Poll for new orders every 10 seconds
    const pollOrders = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;
        
        const { data } = await api.get('/orders');
        if (data.success && Array.isArray(data.data)) {
          for (const order of data.data) {
            const orderIdStr = String(order.id);
            if (!seenOrderIdsRef.current.has(orderIdStr)) {
              seenOrderIdsRef.current.add(orderIdStr);
              
              // New order detected! Play sound, show toast, and queue modal
              console.log('[NotificationContext] New order detected via polling:', order.id);
              playNotificationSound();
              
              const title = 'New Order Recieved';
              const body = `Order ${order.order_number || `#${order.id}`} has been placed by ${order.first_name || ''} ${order.last_name || ''}`;
              setAlertMessage({ title, body });
              setTimeout(() => setAlertMessage(null), 6000);
              
              setNewOrdersQueue(prev => {
                if (prev.some(o => parseInt(o.orderId) === parseInt(order.id))) return prev;
                return [
                  ...prev,
                  {
                    orderId: order.id,
                    shopId: order.shop_id || null,
                    shopName: order.shop_name || 'N/A',
                    orderNumber: order.order_number || `#${order.id}`,
                    customerName: `${order.first_name || ''} ${order.last_name || ''}`,
                    amount: order.total_amount,
                    paymentStatus: order.payment_status || 'Pending'
                  }
                ];
              });

              if (order.shop_id) {
                setShopBadgeCounts(prev => ({
                  ...prev,
                  [order.shop_id]: (prev[order.shop_id] || 0) + 1
                }));
              }
            }
          }
        }
      } catch (err) {
        console.error('Error polling for new orders:', err);
      }
    };

    const pollInterval = setInterval(pollOrders, 10000);

    // Listen to foreground notifications
    const unsubscribe = onMessageListener((payload) => {
      if (payload) {
        handleIncomingNotification(payload);
      }
    });

    // Listen to messages from background service worker (when tab is in background)
    const handleServiceWorkerMessage = (event) => {
      if (event.data && event.data.type === 'fcm-background-message') {
        console.log('Received FCM message from service worker:', event.data.payload);
        handleIncomingNotification(event.data.payload);
      }
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    // Local Test Fallback Event (allows simulating new orders easily from browser console)
    const handleLocalSimulate = (event) => {
      if (event.detail) {
        console.log('Simulating local notification payload:', event.detail);
        handleIncomingNotification(event.detail);
      }
    };
    window.addEventListener('simulate-fcm-notification', handleLocalSimulate);

    return () => {
      clearInterval(pollInterval);
      if (unsubscribe) unsubscribe();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
      window.removeEventListener('simulate-fcm-notification', handleLocalSimulate);
    };
  }, []);

  const handleIncomingNotification = async (payload) => {
    const orderId = payload.data?.orderId || null;
    const type = payload.data?.type || 'new_order';

    // Prevent duplicate processing of identical notifications (foreground de-duplication)
    const msgId = payload.messageId || payload.fcmMessageId || payload.fcmOptions?.messageId;
    if (msgId) {
      if (seenOrderIdsRef.current.has(msgId)) {
        console.log(`De-duplicated foreground notification with msg ID: ${msgId}`);
        return;
      }
      seenOrderIdsRef.current.add(msgId);
      if (seenOrderIdsRef.current.size > 50) {
        const firstVal = seenOrderIdsRef.current.values().next().value;
        seenOrderIdsRef.current.delete(firstVal);
      }
    } else if (type === 'new_order' && orderId) {
      // Fallback deduplication for local simulation or if messageId is missing
      if (seenOrderIdsRef.current.has(orderId)) {
        return;
      }
      seenOrderIdsRef.current.add(orderId);
      if (seenOrderIdsRef.current.size > 50) {
        const firstVal = seenOrderIdsRef.current.values().next().value;
        seenOrderIdsRef.current.delete(firstVal);
      }
    }

    // Play notification sound
    playNotificationSound();

    const title = payload.notification?.title || 'Notification';
    const body = payload.notification?.body || '';

    // Show Toast Alert
    setAlertMessage({ title, body });
    setTimeout(() => setAlertMessage(null), 6000);

    // If it's a new order notification, we fetch details (specifically shopId)
    if (type === 'new_order' && orderId) {
      try {
        const { data: resData } = await api.get(`/orders/${orderId}`);
        if (resData.success && resData.data) {
          const orderObj = resData.data;
          const targetShopId = orderObj.shop_id;

          // Update badge count for this shop
          setShopBadgeCounts(prev => ({
            ...prev,
            [targetShopId]: (prev[targetShopId] || 0) + 1
          }));

          // Trigger new order Modal popup (adds to queue)
          setNewOrdersQueue(prev => {
            if (prev.some(o => parseInt(o.orderId) === parseInt(orderId))) return prev;
            return [
              ...prev,
              {
                orderId,
                shopId: targetShopId,
                shopName: orderObj.shop_name || 'N/A',
                orderNumber: orderObj.order_number || `#${orderId}`,
                customerName: `${orderObj.first_name || ''} ${orderObj.last_name || ''}`,
                amount: orderObj.total_amount,
                paymentStatus: orderObj.payment_status || 'Pending'
              }
            ];
          });
        }
      } catch (err) {
        console.error('Failed to resolve shopId for new order:', err);
      }
    }
  };

  const clearBadgeForShop = (shopId) => {
    setShopBadgeCounts(prev => ({
      ...prev,
      [shopId]: 0
    }));
  };

  return (
    <NotificationContext.Provider value={{
      alertMessage,
      setAlertMessage,
      newOrderInfo,
      setNewOrderInfo,
      newOrdersQueue,
      setNewOrdersQueue,
      acceptCurrentNewOrder,
      acceptOrderById,
      dismissOrderById,
      shopBadgeCounts,
      clearBadgeForShop
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
