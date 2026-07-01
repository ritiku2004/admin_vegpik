import { useState, useEffect } from 'react'
import { FiDollarSign, FiCreditCard, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import api from '../api'

export default function PaymentSettings() {
  const [formData, setFormData] = useState({
    paypal_id: '',
    bank_name: '',
    bank_account: '',
    bank_iban: '',
    is_cod_active: true,
    is_paypal_active: true,
    is_bank_transfer_active: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/payment-settings');
      if (data) {
        setFormData({
          paypal_id: data.paypal_id || '',
          bank_name: data.bank_name || '',
          bank_account: data.bank_account || '',
          bank_iban: data.bank_iban || '',
          is_cod_active: data.is_cod_active === 1 || data.is_cod_active === true,
          is_paypal_active: data.is_paypal_active === 1 || data.is_paypal_active === true,
          is_bank_transfer_active: data.is_bank_transfer_active === 1 || data.is_bank_transfer_active === true
        });
      }
    } catch (err) {
      console.error('Failed to fetch payment settings', err);
      showBanner('error', 'Failed to fetch payment settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
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
      await api.put('/payment-settings', formData);
      showBanner('success', 'Payment Settings saved successfully!');
    } catch (err) {
      console.error(err);
      showBanner('error', 'Failed to update payment settings');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>Payment Settings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure PayPal and Bank Transfer details for your customers.</p>
        </div>
      </div>

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

      <div className="glass-panel" style={{ padding: '32px', width: '100%' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Active Payment Methods */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              <FiCheckCircle size={24} color="var(--accent-primary)" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Active Payment Methods</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name="is_cod_active"
                  checked={formData.is_cod_active}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
                <span style={{ fontWeight: 500, fontSize: '1rem' }}>Enable Cash on Delivery (COD)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name="is_paypal_active"
                  checked={formData.is_paypal_active}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
                <span style={{ fontWeight: 500, fontSize: '1rem' }}>Enable PayPal</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name="is_bank_transfer_active"
                  checked={formData.is_bank_transfer_active}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
                <span style={{ fontWeight: 500, fontSize: '1rem' }}>Enable Bank Transfer</span>
              </label>
            </div>
          </div>

          {formData.is_paypal_active && (
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              <FiDollarSign size={24} color="var(--accent-primary)" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>PayPal Configuration</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
              <div className="input-group">
                <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Admin PayPal ID</label>
                <input 
                  type="text" 
                  name="paypal_id" 
                  value={formData.paypal_id} 
                  onChange={handleInputChange} 
                  className="input-field" 
                  placeholder="e.g. your_paypal_email@example.com"
                  style={{ width: '100%', padding: '10px 12px' }}
                />
              </div>
            </div>
          </div>
          )}

          {formData.is_bank_transfer_active && (
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              <FiCreditCard size={24} color="var(--accent-primary)" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Bank Transfer Details</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '24px' }}>
              <div className="input-group">
                <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Bank Name</label>
                <input 
                  type="text" 
                  name="bank_name" 
                  value={formData.bank_name} 
                  onChange={handleInputChange} 
                  className="input-field" 
                  placeholder="e.g. First Bank"
                  style={{ width: '100%', padding: '10px 12px' }}
                />
              </div>
              <div className="input-group">
                <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Account Number</label>
                <input 
                  type="text" 
                  name="bank_account" 
                  value={formData.bank_account} 
                  onChange={handleInputChange} 
                  className="input-field" 
                  placeholder="e.g. 123456789"
                  style={{ width: '100%', padding: '10px 12px' }}
                />
              </div>
              <div className="input-group">
                <label style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>IBAN</label>
                <input 
                  type="text" 
                  name="bank_iban" 
                  value={formData.bank_iban} 
                  onChange={handleInputChange} 
                  className="input-field" 
                  placeholder="e.g. AE0000000000000"
                  style={{ width: '100%', padding: '10px 12px' }}
                />
              </div>
            </div>
          </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSaving}
              style={{ minWidth: '160px', opacity: isSaving ? 0.7 : 1, display: 'flex', justifyContent: 'center' }}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
