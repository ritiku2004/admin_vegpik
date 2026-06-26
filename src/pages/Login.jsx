import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      if (data.success && data.data.token) {
        localStorage.setItem('admin_token', data.data.token);
        localStorage.setItem('admin_info', JSON.stringify(data.data.admin));
        
        // Let user see loader for a brief moment for premium feel, then redirect
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid credentials or server error.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.05) 0%, rgba(255, 255, 255, 1) 90%)',
      padding: '24px',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Dynamic Background Blobs */}
      <style>{`
        @keyframes blob-bounce {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.15); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
        }
        @keyframes spin-ring {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-logo {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.08); opacity: 1; filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.25)); }
        }
        @keyframes card-appear {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes error-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-card {
          animation: card-appear 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .input-wrapper:focus-within {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12) !important;
          background-color: #ffffff !important;
        }
      `}</style>

      {/* Blob 1 */}
      <div style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
        top: '-100px',
        left: '-100px',
        filter: 'blur(50px)',
        zIndex: 0,
        animation: 'blob-bounce 20s infinite alternate'
      }} />

      {/* Blob 2 */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
        bottom: '-150px',
        right: '-150px',
        filter: 'blur(60px)',
        zIndex: 0,
        animation: 'blob-bounce 25s infinite alternate-reverse'
      }} />

      {/* Login Card */}
      <div className="animate-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '54px 44px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '28px',
        boxShadow: '0 20px 50px rgba(16, 185, 129, 0.06), 0 0 0 1px rgba(16, 185, 129, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.7)',
        zIndex: 1,
        position: 'relative'
      }}>
        {/* Brand Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            backgroundColor: '#10b981',
            borderRadius: '18px',
            marginBottom: '16px',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
            color: '#ffffff',
            fontSize: '1.8rem',
            fontWeight: 800
          }}>
            FS
          </div>
          <h2 style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            color: '#111827',
            letterSpacing: '-0.75px',
            marginBottom: '6px'
          }}>
            FreshSabjiHub
          </h2>
          <p style={{ color: '#4b5563', fontSize: '0.95rem', fontWeight: 500 }}>
            Admin Control Center
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: '12px',
            marginBottom: '24px',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: 500,
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.05)',
            animation: 'error-shake 0.4s ease-in-out'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px' }}>
              EMAIL ADDRESS
            </label>
            <div className="input-wrapper" style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f9fafb',
              border: '1.5px solid #e5e7eb',
              borderRadius: '14px',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <FiMail style={{ position: 'absolute', left: '16px', color: '#9ca3af', fontSize: '1.2rem' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '15px 16px 15px 48px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: '#111827',
                  fontWeight: 500
                }}
                placeholder="admin@freshsabjihub.com"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px' }}>
              PASSWORD
            </label>
            <div className="input-wrapper" style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f9fafb',
              border: '1.5px solid #e5e7eb',
              borderRadius: '14px',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <FiLock style={{ position: 'absolute', left: '16px', color: '#9ca3af', fontSize: '1.2rem' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '15px 44px 15px 48px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: '#111827',
                  fontWeight: 500
                }}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af',
                  fontSize: '1.2rem',
                  padding: '4px',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#4b5563'}
                onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{ 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: '10px', 
              marginTop: '10px',
              padding: '16px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1.5px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(16, 185, 129, 0.3)';
              e.currentTarget.style.filter = 'brightness(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.2)';
              e.currentTarget.style.filter = 'none';
            }}
          >
            <FiLogIn style={{ fontSize: '1.1rem' }} /> Sign In to Panel
          </button>
        </form>
      </div>

      {/* Premium Loader Overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            {/* Spinning Ring */}
            <div style={{
              position: 'absolute',
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              border: '3px solid rgba(16, 185, 129, 0.08)',
              borderTop: '3px solid #10b981',
              animation: 'spin-ring 1s cubic-bezier(0.55, 0.055, 0.675, 0.19) infinite'
            }} />
            
            {/* Pulsing Brand Loader Image */}
            <img 
              src="/loader.png" 
              alt="Loading..." 
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'contain',
                zIndex: 1,
                animation: 'pulse-logo 1.8s ease-in-out infinite'
              }}
            />
          </div>
          
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#111827',
            margin: '0 0 6px 0',
            letterSpacing: '-0.3px'
          }}>
            Signing In...
          </h3>
          <p style={{
            fontSize: '0.9rem',
            fontWeight: 500,
            color: '#4b5563',
            margin: 0
          }}>
            Setting up your secure workspace
          </p>
        </div>
      )}
    </div>
  );
}
