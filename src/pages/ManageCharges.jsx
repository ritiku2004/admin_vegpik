import { useState, useEffect } from 'react'
import { FiDollarSign, FiTruck, FiSliders, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import api from '../api'

export default function ManageCharges() {
  const [formData, setFormData] = useState({
    delivery_base_charge: 30,
    delivery_distance_rate: 5,
    free_delivery_threshold: 300,
    handling_fee: 15,
    free_handling_threshold: 500
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchCharges();
  }, []);

  const fetchCharges = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/charges');
      if (data.success && data.data) {
        setFormData({
          delivery_base_charge: Number(data.data.delivery_base_charge),
          delivery_distance_rate: Number(data.data.delivery_distance_rate),
          free_delivery_threshold: Number(data.data.free_delivery_threshold),
          handling_fee: Number(data.data.handling_fee),
          free_handling_threshold: Number(data.data.free_handling_threshold)
        });
      }
    } catch (err) {
      console.error('Failed to fetch charges', err);
      showBanner('error', 'Failed to fetch active charges settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showBanner = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage(null);
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const { data } = await api.put('/charges', {
        delivery_base_charge: Number(formData.delivery_base_charge),
        delivery_distance_rate: Number(formData.delivery_distance_rate),
        free_delivery_threshold: Number(formData.free_delivery_threshold),
        handling_fee: Number(formData.handling_fee),
        free_handling_threshold: Number(formData.free_handling_threshold)
      });
      if (data.success) {
        showBanner('success', 'Charges configuration saved successfully!');
      }
    } catch (err) {
      console.error(err);
      showBanner('error', 'Failed to update charges configuration');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>Manage Charges</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure global delivery rates, distance calculations, and handling fees</p>
        </div>
      </div>

      {/* Toast Alert Banner */}
      {message && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderRadius: '8px',
          marginBottom: '24px',
          backgroundColor: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FCA5A5'}`,
          color: message.type === 'success' ? '#065F46' : '#991B1B',
          fontWeight: 500,
          transition: 'all 0.3s ease'
        }}>
          {message.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Section 1: Delivery Charges */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
              <FiTruck size={22} color="var(--accent-primary)" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Delivery Charges & Thresholds</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
              <div className="input-group">
                <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Base Delivery Charge (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required 
                  name="delivery_base_charge" 
                  value={formData.delivery_base_charge} 
                  onChange={handleInputChange} 
                  className="input-field" 
                  style={{ width: '100%', padding: '10px 12px' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>Flat rate charged for any delivery.</span>
              </div>

              <div className="input-group">
                <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Distance Rate (₹ / KM)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required 
                  name="delivery_distance_rate" 
                  value={formData.delivery_distance_rate} 
                  onChange={handleInputChange} 
                  className="input-field" 
                  style={{ width: '100%', padding: '10px 12px' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>Additional fee computed per kilometer from shop to user.</span>
              </div>

              <div className="input-group">
                <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Free Delivery Threshold (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required 
                  name="free_delivery_threshold" 
                  value={formData.free_delivery_threshold} 
                  onChange={handleInputChange} 
                  className="input-field" 
                  style={{ width: '100%', padding: '10px 12px' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>Subtotal amount above which delivery is completely free.</span>
              </div>
            </div>
          </div>

          {/* Section 2: Handling Fees */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
              <FiSliders size={22} color="var(--accent-primary)" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Handling Fees</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
              <div className="input-group">
                <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Standard Handling Fee (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required 
                  name="handling_fee" 
                  value={formData.handling_fee} 
                  onChange={handleInputChange} 
                  className="input-field" 
                  style={{ width: '100%', padding: '10px 12px' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>Flat packing/handling fee per checkout order.</span>
              </div>

              <div className="input-group">
                <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Free Handling Threshold (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required 
                  name="free_handling_threshold" 
                  value={formData.free_handling_threshold} 
                  onChange={handleInputChange} 
                  className="input-field" 
                  style={{ width: '100%', padding: '10px 12px' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>Subtotal amount above which handling fees are waived.</span>
              </div>
            </div>
          </div>

          {/* Footer Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '24px', marginTop: '8px' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSaving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              <FiDollarSign size={18} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
