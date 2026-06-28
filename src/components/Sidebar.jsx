import { useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  FiHome, FiList, FiImage, FiLayers, FiShoppingBag,
  FiMapPin, FiX, FiLogOut, FiUsers, FiDollarSign
} from 'react-icons/fi'
import { useNotification } from '../context/NotificationContext'
import logo from '../assets/logo.png'

const globalLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: <FiHome /> },
  { name: 'Orders', path: '/orders', icon: <FiShoppingBag /> },
  { name: 'Products', path: '/global-products', icon: <FiLayers /> },
  { name: 'Categories', path: '/categories', icon: <FiList /> },
  { name: 'Banners', path: '/banners', icon: <FiImage /> },
  { name: 'Users', path: '/users', icon: <FiUsers /> },
  { name: 'Shop Settings', path: '/manage-shops', icon: <FiMapPin /> },
  { name: 'Manage Charges', path: '/manage-charges', icon: <FiDollarSign /> },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { shopBadgeCounts } = useNotification();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login', { replace: true });
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth <= 768) setIsOpen(false);
  }, [location, setIsOpen]);

  return (
    <aside
      className={`sidebar ${isOpen ? 'open' : ''}`}
      style={{
        width: 'var(--sidebar-width)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
        height: '100vh',
        position: 'relative',
      }}
    >
      {/* Brand Header */}
      <div style={{
        padding: '9px',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={logo}
            alt="Vegpik Logo"
            style={{
              height: '52px',
              maxWidth: '180px',
              objectFit: 'contain',
              flexShrink: 0
            }}
          />
        </div>

        {/* Mobile close */}
        <button
          className="mobile-close-btn"
          onClick={() => setIsOpen(false)}
          style={{
            color: 'var(--text-secondary)',
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '14px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        overflowY: 'auto'
      }}>
        <p style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          padding: '4px 8px 8px',
          marginTop: '4px'
        }}>
          Main Menu
        </p>

        {globalLinks.map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>{link.icon}</span>
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{
        padding: '14px 12px',
        borderTop: '1px solid var(--glass-border)',
        flexShrink: 0
      }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '11px 16px',
            borderRadius: '10px',
            background: 'rgba(248, 113, 113, 0.1)',
            border: '1px solid rgba(248, 113, 113, 0.2)',
            color: 'var(--accent-danger)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(248, 113, 113, 0.18)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)';
          }}
        >
          <FiLogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
