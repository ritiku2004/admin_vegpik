import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../api';
import VegpikLogo from '../assets/Vegpik-logo.png';

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
      background: 'radial-gradient(ellipse at 10% 20%, rgba(34,197,94,0.12) 0%, #0a1a0f 70%)',
      padding: '24px',
      overflow: 'hidden',
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
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15) !important;
          background-color: var(--bg-input) !important;
        }
      `}</style>

      {/* Blob 1 */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 70%)',
        top: '-150px', left: '-150px',
        filter: 'blur(60px)', zIndex: 0,
        animation: 'blob-bounce 20s infinite alternate'
      }} />

      {/* Blob 2 */}
      <div style={{
        position: 'absolute', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(22,163,74,0.12) 0%, transparent 70%)',
        bottom: '-200px', right: '-200px',
        filter: 'blur(70px)', zIndex: 0,
        animation: 'blob-bounce 25s infinite alternate-reverse'
      }} />

      {/* Login Card */}
      <div className="animate-card" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '44px 36px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-secondary)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.1)',
        border: '1px solid var(--glass-border)',
        zIndex: 1,
        position: 'relative'
      }}>
        {/* Brand Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <img src={VegpikLogo} alt="Vegpik Logo" style={{ width: '64px', height: '64px', borderRadius: '18px', marginBottom: '16px', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            Vegpik
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Admin Control Center</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{
            width: '100%', padding: '12px 16px',
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.3)',
            color: 'var(--accent-danger)',
            borderRadius: '10px', marginBottom: '20px',
            textAlign: 'center', fontSize: '0.88rem', fontWeight: 500,
            animation: 'error-shake 0.4s ease-in-out'
          }}>{error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Email Address
            </label>
            <div className="input-wrapper" style={{
              position: 'relative', display: 'flex', alignItems: 'center',
              backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)',
              borderRadius: '12px', transition: 'all 0.25s ease',
            }}>
              <FiMail style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '13px 14px 13px 42px',
                  backgroundColor: 'transparent', border: 'none', outline: 'none',
                  fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500
                }}
                placeholder="admin@vegpik.com"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Password
            </label>
            <div className="input-wrapper" style={{
              position: 'relative', display: 'flex', alignItems: 'center',
              backgroundColor: 'var(--bg-input)', border: '1px solid var(--glass-border)',
              borderRadius: '12px', transition: 'all 0.25s ease',
            }}>
              <FiLock style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '13px 44px 13px 42px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
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
                  color: 'var(--text-muted)',
                  fontSize: '1.1rem',
                  padding: '4px',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  background: 'none',
                  border: 'none',
                  outline: 'none'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
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
              src={VegpikLogo} 
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
