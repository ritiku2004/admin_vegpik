import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiMapPin, FiShoppingBag, FiPackage, FiClock } from 'react-icons/fi';
import api from '../api';

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/users/${userId}/details`);
      if (data.success) {
        setDetails(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch user details', err);
      alert('Failed to load user details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading user details...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="page-content" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>User not found or failed to load.</p>
        <button onClick={() => navigate('/users')} className="btn-primary" style={{ marginTop: '16px' }}>Back to Users</button>
      </div>
    );
  }

  const { profile, addresses, orders, cartItems } = details;

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={() => navigate('/users')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)' }}>
          <FiArrowLeft />
        </button>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>User Details</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>View comprehensive information for User #{profile.id}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Left Column: Profile and Addresses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Profile Card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <FiUser style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Profile Information</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, overflow: 'hidden' }}>
                  {profile.profile_picture_url ? (
                    <img src={profile.profile_picture_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    `${(profile.first_name || 'U').charAt(0)}${(profile.last_name || '').charAt(0)}`.toUpperCase()
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{profile.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Unnamed Customer'}</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Joined {new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '8px' }}>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email</p>
                  <p style={{ margin: 0, fontWeight: 500 }}>{profile.email || 'Not provided'}</p>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Phone</p>
                  <p style={{ margin: 0, fontWeight: 500 }}>{profile.phone_number || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses Card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <FiMapPin style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Saved Addresses</h2>
            </div>
            
            {addresses && addresses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {addresses.map(addr => (
                  <div key={addr.id} style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: addr.is_default ? '4px solid var(--accent-primary)' : '4px solid transparent' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{addr.title || 'Address'}</span>
                      {!!addr.is_default && <span style={{ fontSize: '0.75rem', padding: '2px 8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', borderRadius: '12px' }}>Default</span>}
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <strong>{addr.receiver_name || profile.first_name || 'Customer'}</strong> 
                      {addr.receiver_mobile ? ` • ${addr.receiver_mobile}` : profile.phone_number ? ` • ${profile.phone_number}` : ''}
                    </p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{(addr.address_line1 || '').replace('||', ', ')}</p>
                    {addr.address_line2 && <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{addr.address_line2}</p>}
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{addr.city}, {addr.state} {addr.zipcode}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No backend addresses saved. (User may use local device addresses)</p>
            )}
          </div>
        </div>

        {/* Right Column: Orders and Cart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Cart */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <FiShoppingBag style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Active Cart</h2>
              <span style={{ marginLeft: 'auto', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>{cartItems ? cartItems.length : 0} items</span>
            </div>
            
            {cartItems && cartItems.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cartItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#fff', overflow: 'hidden' }}>
                      <img src={item.image_url} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>{item.product_name}</p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>₹{item.price} x {item.quantity}</p>
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>Cart is currently empty.</p>
            )}
          </div>

          {/* Orders History */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <FiPackage style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Order History</h2>
            </div>
            
            {orders && orders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.map(order => (
                  <div key={order.id} style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600 }}>Order #{order.order_number}</span>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          padding: '4px 8px', 
                          borderRadius: '12px',
                          backgroundColor: order.status === 'Delivered' ? 'rgba(34, 197, 94, 0.1)' : order.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                          color: order.status === 'Delivered' ? '#22c55e' : order.status === 'Cancelled' ? '#ef4444' : '#eab308'
                        }}>
                          {order.status}
                        </span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>₹{order.total_amount}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                      <FiClock />
                      <span>{new Date(order.created_at).toLocaleString()}</span>
                    </div>

                    <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '12px', paddingBottom: '12px' }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Items ({order.items.length})</p>
                      {order.items.map(item => {
                        const paid = Number(item.price);
                        const mrp = Number(item.mrp_price) || (paid / 0.9);
                        return (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{item.quantity}x {item.product_name}</span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {mrp > paid && (
                                <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                  ₹{(mrp * item.quantity).toFixed(2)}
                                </span>
                              )}
                              <span>₹{(paid * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {(() => {
                      let itemTotalMRP = 0;
                      let productDiscount = 0;
                      order.items.forEach(item => {
                        const paid = Number(item.price);
                        const mrp = Number(item.mrp_price) || (paid / 0.9);
                        itemTotalMRP += mrp * item.quantity;
                        productDiscount += (mrp - paid) * item.quantity;
                      });

                      return (
                        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                             <span>Item Subtotal (MRP)</span>
                             <span>₹{itemTotalMRP.toFixed(2)}</span>
                           </div>
                           {productDiscount > 0 && (
                             <div style={{ display: 'flex', justifyContent: 'space-between', color: '#22c55e' }}>
                               <span>Product Discount (10% Off)</span>
                               <span>-₹{productDiscount.toFixed(2)}</span>
                             </div>
                           )}
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                             <span>Handling Charge</span>
                             <span>₹{Number(order.handling_fee || 0).toFixed(2)}</span>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                             <span>Delivery Fee</span>
                             <span>₹{Number(order.delivery_fee || 0).toFixed(2)}</span>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                             <span>Tip</span>
                             <span>₹{Number(order.tip_amount || 0).toFixed(2)}</span>
                           </div>
                           {Number(order.discount_amount) > 0 && (
                             <div style={{ display: 'flex', justifyContent: 'space-between', color: '#22c55e' }}>
                               <span>Promo/Coupon Discount</span>
                               <span>-₹{Number(order.discount_amount).toFixed(2)}</span>
                             </div>
                           )}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No past orders found.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
