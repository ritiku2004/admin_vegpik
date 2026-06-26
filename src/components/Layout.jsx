import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useNotification } from '../context/NotificationContext'
import { FiCopy } from 'react-icons/fi'
import api from '../api'

export default function Layout({ shops }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { alertMessage, setAlertMessage, newOrderInfo, setNewOrderInfo, acceptCurrentNewOrder } = useNotification();
  const navigate = useNavigate();
  const [copyingOrderId, setCopyingOrderId] = useState(null);
  const [copied, setCopied] = useState(false);

  const match = window.location.pathname.match(/\/shop\/(\d+)/);
  const currentShopId = match ? parseInt(match[1]) : null;
  const isCorrectShop = currentShopId && newOrderInfo && parseInt(currentShopId) === parseInt(newOrderInfo.shopId);

  const handleCopyOrder = async () => {
    if (!newOrderInfo) return;
    try {
      setCopyingOrderId(newOrderInfo.orderId);
      const { data } = await api.get(`/orders/${newOrderInfo.orderId}`);
      if (data.success) {
        const order = data.data;
        const receiverName = order.receiver_name || `${order.first_name} ${order.last_name}`;
        const receiverMobile = order.receiver_mobile || order.user_phone || 'N/A';
        
        const addressParts = [
          order.address_line1,
          order.address_line2,
          order.city,
          order.state,
          order.zipcode
        ].filter(Boolean);
        const addressStr = addressParts.length > 0 ? addressParts.join(', ') : 'N/A';

        let mapUrl = 'N/A';
        if (order.latitude && order.longitude) {
          mapUrl = `https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`;
        } else if (addressStr !== 'N/A') {
          mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressStr)}`;
        }

        const itemsList = order.items && order.items.length > 0
          ? order.items.map(item => `- ${item.product_name || item.name} (Price: ₹${parseFloat(item.price).toFixed(2)}, Qty: ${item.quantity})`).join('\n')
          : 'No items';

        let paymentStatusStr = 'Pending';
        if (order.payment_method === 'COD') {
          paymentStatusStr = 'Cash on Delivery';
        } else if (order.payment_status === 'Paid') {
          paymentStatusStr = 'Payment Done';
        } else if (order.payment_status === 'Failed') {
          paymentStatusStr = 'Payment Failed';
        } else {
          paymentStatusStr = order.payment_status || 'Pending';
        }

        const copiedText = `Receiver Name: ${receiverName}
Mobile Number: ${receiverMobile}
Location: ${addressStr}
Google Map URL: ${mapUrl}
Payment Status: ${paymentStatusStr}

Order Detail:
${itemsList}

Total Amount: ₹${parseFloat(order.total_amount).toFixed(2)}`;

        await navigator.clipboard.writeText(copiedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy order details', err);
    } finally {
      setCopyingOrderId(null);
    }
  };

  const handleViewOrder = () => {
    if (newOrderInfo) {
      const { shopId, orderId } = newOrderInfo;
      // Close modal first
      setNewOrderInfo(null);
      // Navigate to order details
      navigate(`/shop/${shopId}/orders/${orderId}`);
    }
  };

  return (
    <div className="app-container">
      {/* Dynamic Push Notification Banner */}
      {alertMessage && isCorrectShop && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#10B981',
          color: '#FFFFFF',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s ease-out',
          minWidth: '280px'
        }}>
          <strong style={{ fontSize: '15px', fontWeight: 'bold' }}>{alertMessage.title}</strong>
          <span style={{ fontSize: '13px', marginTop: '4px', opacity: 0.9 }}>{alertMessage.body}</span>
          <button 
            onClick={() => setAlertMessage(null)} 
            style={{
              position: 'absolute',
              top: '4px',
              right: '8px',
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* New Order Alert Modal Popup */}
      {newOrderInfo && isCorrectShop && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="glass-panel" style={{
            width: '90%',
            maxWidth: '450px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              margin: '0 auto 8px auto'
            }}>
              🛒
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                New Order Received!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Order <strong style={{ color: 'var(--accent-primary)' }}>{newOrderInfo.orderNumber}</strong> has been placed by <strong>{newOrderInfo.customerName || 'Customer'}</strong>.
              </p>
            </div>
            
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid #e2e8f0',
              marginTop: '8px'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total Amount:</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                ₹{parseFloat(newOrderInfo.amount).toFixed(2)}
              </strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <button 
                onClick={acceptCurrentNewOrder}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'background-color 0.2s',
                  fontSize: '15px'
                }}
              >
                Accept Order (Set to Processing)
              </button>
              <button 
                onClick={handleCopyOrder}
                disabled={copyingOrderId !== null}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FiCopy /> {copyingOrderId ? 'Copying...' : (copied ? 'Copied!' : 'Copy Order Details Info')}
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setNewOrderInfo(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: '#f1f5f9',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Dismiss
                </button>
                <button 
                  onClick={handleViewOrder}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--accent-primary)',
                    color: 'white',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    transition: 'background-color 0.2s'
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      
      <Sidebar shops={shops} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="main-content">
        <Header shops={shops} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="page-content" onClick={() => { if(isSidebarOpen && window.innerWidth <= 768) setIsSidebarOpen(false) }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
