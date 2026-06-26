import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { FiHome, FiList, FiImage, FiLayers, FiChevronDown, FiChevronRight, FiBox, FiShoppingBag, FiMapPin, FiX, FiLogOut, FiUsers, FiDollarSign } from 'react-icons/fi'
import { useNotification } from '../context/NotificationContext'

export default function Sidebar({ shops, isOpen, setIsOpen }) {
  const [expandedShop, setExpandedShop] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { shopBadgeCounts, clearBadgeForShop } = useNotification();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login', { replace: true });
  };

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  }, [location, setIsOpen]);

  const toggleShop = (shopId) => {
    setExpandedShop(prev => prev === shopId ? null : shopId);
    // Clear badge count when admin clicks on/expands the shop
    clearBadgeForShop(shopId);
  };

  const globalLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiHome /> },
    { name: 'Global Products', path: '/global-products', icon: <FiLayers /> },
    { name: 'Manage Shops', path: '/manage-shops', icon: <FiMapPin /> },
    { name: 'Categories', path: '/categories', icon: <FiList /> },
    { name: 'Banners', path: '/banners', icon: <FiImage /> },
    { name: 'Users', path: '/users', icon: <FiUsers /> },
    { name: 'Manage Charges', path: '/manage-charges', icon: <FiDollarSign /> },
  ];

  return (
    <aside className={`glass-panel sidebar ${isOpen ? 'open' : ''}`} style={{
      width: 'var(--sidebar-width)',
      margin: '16px 0 16px 16px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'var(--transition-normal)',
      flexShrink: 0
    }}>
      <div style={{
        padding: '24px',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          background: 'linear-gradient(to right, var(--accent-primary), #60a5fa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '1px'
        }}>
          Admin Panel
        </h2>
        {/* Mobile Close Button */}
        <button className="mobile-close-btn" onClick={() => setIsOpen(false)}>
          <FiX />
        </button>
      </div>


      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        {globalLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: isActive ? 'white' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
              boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
              transition: 'var(--transition-fast)'
            })}
          >
            <span style={{ fontSize: '1.2rem', color: 'inherit' }}>{link.icon}</span>
            <span style={{ fontWeight: 500 }}>{link.name}</span>
          </NavLink>
        ))}

        {shops && shops.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0 16px', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>
              Shops
            </p>
            {shops.map(shop => {
              const badgeCount = shopBadgeCounts[shop.id] || 0;
              return (
                <div key={shop.id} style={{ marginBottom: '4px' }}>
                  <button
                    onClick={() => toggleShop(shop.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      color: 'var(--text-secondary)',
                      backgroundColor: expandedShop === shop.id ? '#f1f5f9' : 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      transition: 'var(--transition-fast)',
                      position: 'relative'
                    }}
                  >
                    <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {shop.name}
                      {badgeCount > 0 && (
                        <span style={{
                          backgroundColor: '#EF4444',
                          color: 'white',
                          borderRadius: '10px',
                          padding: '2px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          animation: 'pulse 2s infinite'
                        }}>
                          {badgeCount}
                        </span>
                      )}
                    </span>
                    {expandedShop === shop.id ? <FiChevronDown /> : <FiChevronRight />}
                  </button>
                  {expandedShop === shop.id && (
                    <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      <NavLink
                        to={`/shop/${shop.id}/inventory`}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        style={({ isActive }) => ({
                          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px',
                          color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        })}
                      >
                        <FiBox /> Inventory
                      </NavLink>
                      <NavLink
                        to={`/shop/${shop.id}/orders`}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        style={({ isActive }) => ({
                          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px',
                          color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        })}
                      >
                        <FiShoppingBag /> Orders
                      </NavLink>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </nav>

      {/* Logout Button */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--glass-border)' }}>
        <button
          onClick={handleLogout}
          className="btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            boxShadow: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fecaca';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fee2e2';
          }}
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
