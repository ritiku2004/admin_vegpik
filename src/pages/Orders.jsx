import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiEye, FiClock, FiCheck, FiTruck, FiX, FiCopy } from 'react-icons/fi'
import api from '../api'

export default function Orders({ shops }) {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [copyingOrderId, setCopyingOrderId] = useState(null);
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const handleCopyOrder = async (orderSummary) => {
    try {
      setCopyingOrderId(orderSummary.id);
      const { data } = await api.get(`/orders/${orderSummary.id}`);
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
        setCopiedOrderId(orderSummary.id);
        setTimeout(() => setCopiedOrderId(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy order details', err);
    } finally {
      setCopyingOrderId(null);
    }
  };
  
  const activeShop = shops.find(s => s.id === parseInt(shopId));

  useEffect(() => {
    if (activeShop) {
      fetchOrders();
    }
  }, [activeShop]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders', { params: { shopId: activeShop.id } });
      if (data.success) setOrders(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending Payment': return '#f59e0b'; // Amber / Orange
      case 'Placed': return '#f59e0b';
      case 'Processing': return 'var(--accent-warning)';
      case 'Shipped': return '#8b5cf6';
      case 'Delivered': return 'var(--accent-success)';
      case 'Cancelled': return 'var(--accent-danger)';
      default: return 'var(--text-secondary)';
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending Payment': return <FiClock />;
      case 'Placed': return <FiClock />;
      case 'Processing': return <FiClock />;
      case 'Shipped': return <FiTruck />;
      case 'Delivered': return <FiCheck />;
      case 'Cancelled': return <FiX />;
      default: return null;
    }
  }

  const filteredOrders = statusFilter === 'All'
    ? orders
    : orders.filter(order => order.status === statusFilter);

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>Orders</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage recent orders for <strong>{activeShop ? activeShop.name : '...'}</strong></p>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              backgroundColor: '#ffffff',
              color: 'var(--text-primary)',
              fontWeight: 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '200px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            {['All', 'Pending Payment', 'Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => {
              const count = status === 'All' 
                ? orders.length 
                : orders.filter(o => o.status === status).length;
              return (
                <option key={status} value={status}>
                  {status} ({count})
                </option>
              )
            })}
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{order.order_number}</td>
                  <td>{order.first_name} {order.last_name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{parseFloat(order.total_amount).toFixed(2)}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      backgroundColor: `${getStatusColor(order.status).startsWith('var') ? getStatusColor(order.status).replace(')', ', 0.1)').replace('var(', 'rgba(') : `${getStatusColor(order.status)}15`}`,
                      color: getStatusColor(order.status)
                    }}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      className="btn" 
                      onClick={() => handleCopyOrder(order)}
                      disabled={copyingOrderId === order.id}
                      style={{ padding: '6px 12px', border: '1px solid #cbd5e1', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FiCopy /> {copyingOrderId === order.id ? 'Copying...' : (copiedOrderId === order.id ? 'Copied!' : 'Copy')}
                    </button>
                    <button 
                      className="btn" 
                      onClick={() => navigate(`/shop/${shopId}/orders/${order.id}`)}
                      style={{ padding: '6px 12px', border: '1px solid #cbd5e1', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FiEye /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    {statusFilter === 'All' 
                      ? 'No orders found for this shop.' 
                      : `No ${statusFilter} orders found for this shop.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
