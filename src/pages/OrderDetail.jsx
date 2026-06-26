import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiMapPin, FiPackage, FiClock, FiCopy, FiExternalLink, FiShield } from 'react-icons/fi';
import api from '../api';

export default function OrderDetail() {
  const { shopId, orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/orders/${orderId}`);
      if (data.success) {
        setOrder(data.data);
        setNewStatus(data.data.status);
      }
    } catch (err) {
      console.error('Failed to fetch order details', err);
      alert('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      const { data } = await api.put(`/orders/${order.id}`, {
        status: newStatus,
        payment_status: order.payment_status
      });
      if (data.success) {
        showToast('Order status updated successfully');
        setOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkPaymentDone = async () => {
    if (!order) return;
    setUpdatingPayment(true);
    try {
      const { data } = await api.put(`/orders/${order.id}`, {
        status: order.status,
        payment_status: 'Paid'
      });
      if (data.success) {
        showToast('Payment marked as Paid successfully');
        setOrder(prev => ({ ...prev, payment_status: 'Paid' }));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to update payment status');
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleCopyOrderInfo = () => {
    if (!order) return;

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

    navigator.clipboard.writeText(copiedText)
      .then(() => {
        showToast('Order info copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy to clipboard');
      });
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending Payment': return '#f59e0b';
      case 'Placed': return '#f59e0b'; // Amber for Placed (Waiting for Confirmation)
      case 'Processing': return 'var(--accent-warning)';
      case 'Shipped': return '#8b5cf6';
      case 'Delivered': return 'var(--accent-success)';
      case 'Cancelled': return 'var(--accent-danger)';
      default: return 'var(--text-secondary)';
    }
  }

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-content" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Order not found or failed to load.</p>
        <button onClick={() => navigate(`/shop/${shopId}/orders`)} className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Orders</button>
      </div>
    );
  }

  const itemsSubtotal = order.items ? order.items.reduce((acc, item) => acc + (item.quantity * parseFloat(item.price)), 0) : 0;

  return (
    <div className="page-content">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#1e293b',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease'
        }}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button 
          onClick={() => navigate(`/shop/${shopId}/orders`)} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-secondary)', 
            cursor: 'pointer', 
            fontSize: '1.2rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--bg-secondary)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <FiArrowLeft />
        </button>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>Order Details</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Manage and view information for Order <strong style={{ color: 'var(--accent-primary)' }}>#{order.order_number}</strong>
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
        
        {/* Left Column: Status Update & Receiver Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Status Update Card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <FiPackage style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Order Status</h2>
              <span style={{
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: `${getStatusColor(order.status).startsWith('var') ? getStatusColor(order.status).replace(')', ', 0.1)').replace('var(', 'rgba(') : `${getStatusColor(order.status)}15`}`,
                color: getStatusColor(order.status)
              }}>
                {order.status}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <select 
                  className="input-field" 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px' }}
                >
                  <option value="Pending Payment">Pending Payment</option>
                  <option value="Placed">Placed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleUpdateStatus} 
                disabled={updatingStatus}
                style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Payment Information Card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <FiShield style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Payment Information</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Payment Status</span>
                  <span style={{ 
                    fontWeight: 600, 
                    color: order.payment_status === 'Paid' ? 'var(--accent-success)' : order.payment_status === 'Failed' ? 'var(--accent-danger)' : '#f59e0b',
                    fontSize: '1rem' 
                  }}>
                    {order.payment_status || 'Pending'}
                  </span>
                </div>
                {order.payment_status !== 'Paid' && (
                  <button
                    onClick={handleMarkPaymentDone}
                    disabled={updatingPayment}
                    className="btn btn-primary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      backgroundColor: 'var(--accent-success)',
                      borderColor: 'var(--accent-success)',
                      color: 'white',
                      boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    {updatingPayment ? 'Updating...' : 'Mark Paid'}
                  </button>
                )}
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Razorpay Order ID</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {order.razorpay_order_id || 'N/A'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Razorpay Payment ID</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {order.razorpay_payment_id || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Receiver Information Card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <FiUser style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Receiver Details</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.95rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Receiver Name</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                  {order.receiver_name || `${order.first_name} ${order.last_name}`}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Mobile Number</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                  {order.receiver_mobile || order.user_phone || 'N/A'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Delivery Location</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  {[
                    order.address_line1,
                    order.address_line2,
                    order.city,
                    order.state,
                    order.zipcode
                  ].filter(Boolean).join(', ') || 'No address details'}
                </span>
              </div>
              
              {((order.latitude && order.longitude) || order.address_line1) && (
                <div style={{ marginTop: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <a 
                    href={
                      order.latitude && order.longitude
                        ? `https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([order.address_line1, order.city, order.zipcode].filter(Boolean).join(', '))}`
                    }
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'var(--accent-primary)',
                      fontWeight: 600,
                      textDecoration: 'none',
                      fontSize: '0.9rem'
                    }}
                  >
                    <FiExternalLink /> Open Location in Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Copy Action Card */}
          <div style={{ marginTop: '8px' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleCopyOrderInfo}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '14px', borderRadius: '12px', backgroundColor: '#3b82f6', borderColor: '#3b82f6', color: '#ffffff' }}
            >
              <FiCopy /> Copy Order Details Info
            </button>
          </div>

        </div>

        {/* Right Column: Order Items & Order Summary Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Order Items & Summary Card */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <FiClock style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Items & Pricing</h2>
              <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Placed: {new Date(order.created_at).toLocaleString()}
              </span>
            </div>

            {/* Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', overflowY: 'auto', maxHeight: '380px', paddingRight: '4px' }}>
              {order.items && order.items.map((item, index) => (
                <div key={item.id || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.product_name || item.name} 
                        style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                    )}
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{item.product_name || item.name}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Qty: {item.quantity} × ₹{parseFloat(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>₹{(item.quantity * parseFloat(item.price)).toFixed(2)}</p>
                </div>
              ))}
              {(!order.items || order.items.length === 0) && (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No items in this order.</p>
              )}
            </div>

            {/* Price Calculations */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem', marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Items Subtotal</span>
                <span style={{ fontWeight: 500 }}>₹{parseFloat(itemsSubtotal).toFixed(2)}</span>
              </div>
              {parseFloat(order.delivery_fee) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
                  <span style={{ fontWeight: 500 }}>₹{parseFloat(order.delivery_fee).toFixed(2)}</span>
                </div>
              )}
              {parseFloat(order.handling_fee) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Handling Fee</span>
                  <span style={{ fontWeight: 500 }}>₹{parseFloat(order.handling_fee).toFixed(2)}</span>
                </div>
              )}
              {parseFloat(order.tip_amount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tip</span>
                  <span style={{ fontWeight: 500 }}>₹{parseFloat(order.tip_amount).toFixed(2)}</span>
                </div>
              )}
              {parseFloat(order.discount_amount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-danger)' }}>
                  <span>Discount</span>
                  <span style={{ fontWeight: 600 }}>-₹{parseFloat(order.discount_amount).toFixed(2)}</span>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #cbd5e1', paddingTop: '14px', marginTop: '6px', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                <span>Grand Total</span>
                <span style={{ color: 'var(--accent-primary)' }}>₹{parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Payment Logs Section */}
      <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
          <FiClock style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Payment Transactions & Reconciliation Logs</h2>
        </div>
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ padding: '12px 8px' }}>Log ID</th>
                <th style={{ padding: '12px 8px' }}>Event Type</th>
                <th style={{ padding: '12px 8px' }}>Razorpay Order ID</th>
                <th style={{ padding: '12px 8px' }}>Razorpay Payment ID</th>
                <th style={{ padding: '12px 8px' }}>Timestamp</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {order.payment_logs && order.payment_logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 500 }}>#{log.id}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor: log.event_type.includes('success') || log.event_type.includes('confirm') ? 'rgba(16, 185, 129, 0.1)' : log.event_type.includes('fail') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: log.event_type.includes('success') || log.event_type.includes('confirm') ? '#10b981' : log.event_type.includes('fail') ? '#ef4444' : '#f59e0b'
                    }}>
                      {log.event_type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.razorpay_order_id || 'N/A'}</td>
                  <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.razorpay_payment_id || 'N/A'}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{new Date(log.created_at).toLocaleString()}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    <button 
                      className="btn"
                      onClick={() => alert(JSON.stringify(JSON.parse(log.payload || '{}'), null, 2))}
                      style={{ padding: '4px 8px', fontSize: '0.8rem', border: '1px solid #cbd5e1' }}
                    >
                      Raw Payload
                    </button>
                  </td>
                </tr>
              ))}
              {(!order.payment_logs || order.payment_logs.length === 0) && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                    No payment logs recorded for this order yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
