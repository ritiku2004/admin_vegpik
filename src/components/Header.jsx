import { useState, useEffect, useRef } from 'react'
import { FiBell, FiUser, FiMenu, FiShoppingBag, FiCheck, FiX, FiEye } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../context/NotificationContext'

export default function Header({ toggleSidebar }) {
  const navigate = useNavigate();
  const { newOrdersQueue, acceptOrderById, dismissOrderById } = useNotification();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
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
      padding: '0 20px',
      borderBottom: '1px solid var(--glass-border)',
      background: 'var(--bg-secondary)',
      zIndex: 100,
      gap: '12px',
    }}>
      {/* Left: Hamburger + Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
        <button
          className="hamburger-btn"
          onClick={toggleSidebar}
          style={{ flexShrink: 0 }}
        >
          <FiMenu />
        </button>

        {/* Brand (visible on desktop) */}
        <div className="desktop-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
            flexShrink: 0
          }}>
            🥦
          </div>
          <span style={{
            fontWeight: 800,
            fontSize: '1.2rem',
            letterSpacing: '-0.4px',
            background: 'linear-gradient(to right, #22c55e, #86efac)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Vegpik
          </span>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)',
            padding: '2px 8px',
            borderRadius: '20px'
          }}>
            Admin
          </span>
        </div>
      </div>

      {/* Right: Notifications + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            style={{
              width: '40px', height: '40px',
              borderRadius: '10px',
              background: dropdownOpen ? 'var(--accent-light)' : 'rgba(255,255,255,0.04)',
              border: '1px solid var(--glass-border)',
              color: dropdownOpen ? 'var(--accent-primary)' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.15rem',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              position: 'relative',
            }}
          >
            <FiBell />
            {newOrdersQueue.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px', right: '-3px',
                background: 'var(--accent-danger)',
                color: '#fff',
                borderRadius: '50%',
                width: '18px', height: '18px',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 2px var(--bg-secondary)',
                animation: 'pulse 2s infinite',
              }}>
                {newOrdersQueue.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: '0',
              width: '320px',
              maxWidth: 'calc(100vw - 32px)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--glass-border)',
              borderRadius: '14px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              maxHeight: '420px',
            }}>
              {/* Header */}
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(34,197,94,0.05)',
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  New Orders
                </span>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700,
                  background: newOrdersQueue.length > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                  color: newOrdersQueue.length > 0 ? 'var(--accent-primary)' : 'var(--text-muted)',
                  padding: '2px 10px',
                  borderRadius: '20px',
                }}>
                  {newOrdersQueue.length} pending
                </span>
              </div>

              {/* Order list */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {newOrdersQueue.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    🎉 No pending orders
                  </div>
                ) : (
                  newOrdersQueue.map(order => (
                    <div
                      key={order.orderId}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--glass-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                            {order.orderNumber}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {order.customerName}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          AED {parseFloat(order.amount).toFixed(2)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => acceptOrderById(order.orderId)}
                          style={{
                            flex: 2, padding: '7px 8px', borderRadius: '8px',
                            background: 'var(--accent-primary)', color: '#fff',
                            border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                          }}
                        >
                          <FiCheck size={12} /> Accept
                        </button>
                        <button
                          onClick={() => { setDropdownOpen(false); navigate(`/orders/${order.orderId}`); }}
                          style={{
                            flex: 1.5, padding: '7px 8px', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)',
                            border: '1px solid var(--glass-border)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                          }}
                        >
                          <FiEye size={12} /> View
                        </button>
                        <button
                          onClick={() => dismissOrderById(order.orderId)}
                          style={{
                            padding: '7px 10px', borderRadius: '8px',
                            background: 'rgba(248,113,113,0.12)', color: 'var(--accent-danger)',
                            border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer', fontSize: '0.75rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
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

        {/* Admin Avatar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '5px 14px 5px 5px',
          background: 'rgba(34,197,94,0.07)',
          border: '1px solid var(--glass-border)',
          borderRadius: '24px',
          cursor: 'default',
        }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
          }}>
            <FiUser size={15} />
          </div>
          <span className="desktop-only" style={{ fontSize: '0.87rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}
