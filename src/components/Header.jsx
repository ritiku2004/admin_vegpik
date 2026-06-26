import { useState, useEffect, useRef } from 'react'
import { FiBell, FiUser, FiMapPin, FiMenu, FiShoppingBag, FiCheck, FiX, FiEye } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { useNotification } from '../context/NotificationContext'

export default function Header({ shops, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const match = location.pathname.match(/\/shop\/(\d+)/);
  const shopId = match ? parseInt(match[1]) : null;
  const activeShop = shopId ? shops?.find(s => s.id === shopId) : null;

  const { newOrdersQueue, acceptOrderById, dismissOrderById } = useNotification();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      height: 'var(--header-height)',
      minHeight: 'var(--header-height)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      margin: '16px 16px 0 16px',
      borderRadius: '16px',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--glass-shadow)',
      zIndex: 999,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="hamburger-btn" onClick={toggleSidebar}>
          <FiMenu />
        </button>
        {activeShop ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <FiMapPin style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{activeShop.name}</span>
          </div>
        ) : (
          <div className="desktop-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-success), #10b981)',
              padding: '6px',
              borderRadius: '8px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
            }}>
              <FiShoppingBag size={16} />
            </div>
            <span style={{ 
              fontWeight: 800, 
              fontSize: '1.35rem', 
              letterSpacing: '-0.5px',
              background: 'linear-gradient(to right, var(--text-primary), var(--accent-success))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Fresh Subji Hub
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Notification Icon Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            className="icon-btn" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1.2rem', 
              transition: 'var(--transition-fast)',
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: dropdownOpen ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
            }}
          >
            <FiBell />
            {newOrdersQueue.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                backgroundColor: '#EF4444',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 2px white',
                animation: 'pulse 2s infinite'
              }}>
                {newOrdersQueue.length}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '40px',
              right: '0',
              width: '320px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E2E8F0',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '400px',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#F8FAFC'
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>Pending Orders</span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#E2E8F0',
                  color: '#475569',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  {newOrdersQueue.length} New
                </span>
              </div>

              <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {newOrdersQueue.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                    No pending new orders
                  </div>
                ) : (
                  newOrdersQueue.map((order) => (
                    <div key={order.orderId} style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #F1F5F9',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'background-color 0.15s'
                    }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: '#3B82F6' }}>{order.orderNumber}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '8px', fontWeight: 500 }}>({order.shopName})</span>
                          <div style={{ fontSize: '0.8rem', color: '#1E293B', fontWeight: 600 }}>{order.customerName}</div>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                          ₹{parseFloat(order.amount).toFixed(2)}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <button 
                          onClick={() => acceptOrderById(order.orderId)}
                          style={{
                            flex: 1.5,
                            padding: '6px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#10B981',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <FiCheck size={12} /> Accept
                        </button>
                        <button 
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate(`/shop/${order.shopId}/orders/${order.orderId}`);
                          }}
                          style={{
                            flex: 1,
                            padding: '6px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#F1F5F9',
                            color: '#334155',
                            border: '1px solid #E2E8F0',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <FiEye size={12} /> View
                        </button>
                        <button 
                          onClick={() => dismissOrderById(order.orderId)}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#FEE2E2',
                            color: '#EF4444',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Dismiss"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '4px 12px 4px 4px',
          background: '#f1f5f9',
          borderRadius: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '50%',
            background: 'var(--accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white'
          }}>
            <FiUser />
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Admin User</span>
        </div>
      </div>
    </header>
  )
}
