import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiImage, FiTrash2, FiEdit2 } from 'react-icons/fi'
import api from '../api'

export default function Banners() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data } = await api.get('/banners');
      if (data.success) setBanners(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/banners/${id}/status`, { is_active: !currentStatus });
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>Banners</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage promotional banners across the app</p>
        </div>
        <Link to="/banners/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <FiPlus /> Add Banner
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {banners.map(banner => (
          <div key={banner.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '160px', background: banner.background_color || '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: banner.text_color || '#94a3b8' }}>
              {banner.image_url ? (
                <img src={banner.image_url} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <FiImage style={{ fontSize: '3rem', opacity: 0.5 }} />
              )}
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{banner.title}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '12px' }}>
                  {banner.location}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  {banner.subtitle || 'No subtitle'}
                </p>
                <button 
                  onClick={() => toggleStatus(banner.id, banner.is_active)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: banner.is_active ? 'rgba(16, 185, 129, 0.1)' : '#e2e8f0',
                    color: banner.is_active ? 'var(--accent-success)' : 'var(--text-secondary)'
                  }}>
                  {banner.is_active ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px', flex: 1 }}>
                {banner.description || 'No description'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 'auto' }}>
                <Link to={`/banners/${banner.id}/edit`} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '8px 16px', fontSize: '0.9rem' }}>
                  <FiEdit2 /> Edit
                </Link>
                <button className="btn btn-danger" onClick={() => handleDelete(banner.id)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                  <FiTrash2 /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>No banners added yet.</p>
        )}
      </div>
    </div>
  )
}
