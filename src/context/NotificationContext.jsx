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

  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      const now = ctx.currentTime;
      playTone(523.25, now, 0.15);      // C5
      playTone(783.99, now + 0.12, 0.3); // G5
    } catch (e) {
      console.warn('Web Audio playback failed or blocked:', e);
    }
  };

  useEffect(() => {
    // Request permission and register token
    requestForToken();

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
    if (type === 'new_order' && orderId) {
      if (seenOrderIdsRef.current.has(orderId)) {
        console.log(`De-duplicated foreground notification for order ID: ${orderId}`);
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
