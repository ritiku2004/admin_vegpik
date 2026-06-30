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
          ? order.items.map(item => `- ${item.product_name || item.name} (Price: AED ${parseFloat(item.price).toFixed(2)}, Qty: ${item.quantity})`).join('\n')
          : 'No items';

        const paymentStatusStr = order.payment_status === 'Paid' ? 'Payment Done' : 'Cash on Delivery';

        const copiedText = `Receiver Name: ${receiverName}
Mobile Number: ${receiverMobile}
Location: ${addressStr}
Google Map URL: ${mapUrl}
Payment Status: ${paymentStatusStr}

Order Detail:
${itemsList}

Total Amount: AED ${parseFloat(order.total_amount).toFixed(2)}`;

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
      const { orderId } = newOrderInfo;
      setNewOrderInfo(null);
      navigate(`/orders/${orderId}`);
    }
  };

  return (
    <div className="app-container">
      {/* Push Notification Banner */}
      {alertMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
          color: '#fff',
          padding: '14px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s ease-out',
          minWidth: '260px',
          maxWidth: '320px',
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          <strong style={{ fontSize: '0.9rem', fontWeight: 700 }}>{alertMessage.title}</strong>
          <span style={{ fontSize: '0.82rem', marginTop: '4px', opacity: 0.9 }}>{alertMessage.body}</span>
          <button
            onClick={() => setAlertMessage(null)}
            style={{
              position: 'absolute', top: '6px', right: '10px',
              background: 'none', border: 'none', color: 'white',
              cursor: 'pointer', fontSize: '16px', lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* New Order Alert Modal */}
      {newOrderInfo && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 99999,
          animation: 'fadeIn 0.2s ease-out',
          padding: '16px',
        }}>
          <div style={{
            width: '100%', maxWidth: '440px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '20px',
            padding: '28px 24px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            display: 'flex', flexDirection: 'column', gap: '16px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'rgba(34,197,94,0.15)',
              color: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', margin: '0 auto 4px',
              border: '1px solid rgba(34,197,94,0.25)',
            }}>🛒</div>

            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                New Order Received!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Order <strong style={{ color: 'var(--accent-primary)' }}>{newOrderInfo.orderNumber}</strong> placed by <strong style={{ color: 'var(--text-primary)' }}>{newOrderInfo.customerName || 'Customer'}</strong>
              </p>
            </div>

            <div style={{
              background: 'rgba(34,197,94,0.07)', borderRadius: '10px', padding: '14px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              border: '1px solid rgba(34,197,94,0.15)',
            }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.88rem' }}>Total Amount</span>
              <strong style={{ fontSize: '1.15rem', color: 'var(--accent-primary)' }}>
                AED {parseFloat(newOrderInfo.amount).toFixed(2)}
              </strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <button
                onClick={acceptCurrentNewOrder}
                style={{
                  padding: '12px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(34,197,94,0.35)', fontSize: '0.95rem',
                  transition: 'var(--transition-fast)',
                }}
              >
                ✅ Accept Order
              </button>
              <button
                onClick={handleCopyOrder}
                disabled={copyingOrderId !== null}
                style={{
                  padding: '12px', borderRadius: '10px',
                  background: 'rgba(56,189,248,0.12)', color: '#38bdf8',
                  border: '1px solid rgba(56,189,248,0.25)', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                  fontSize: '0.9rem',
                }}
              >
                <FiCopy /> {copyingOrderId ? 'Copying...' : (copied ? 'Copied!' : 'Copy Order Details')}
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setNewOrderInfo(null)}
                  style={{
                    flex: 1, padding: '11px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                    border: '1px solid var(--glass-border)', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem',
                  }}
                >
                  Dismiss
                </button>
                <button
                  onClick={handleViewOrder}
                  style={{
                    flex: 1, padding: '11px', borderRadius: '10px',
                    background: 'rgba(34,197,94,0.12)', color: 'var(--accent-primary)',
                    border: '1px solid rgba(34,197,94,0.25)', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem',
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
