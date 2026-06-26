import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiImage, FiSave, FiAlertCircle } from 'react-icons/fi'
import api from '../api'
import CustomSelect from '../components/CustomSelect'

const LIMITS = {
  title: 35,
  subtitle: 20,
  description: 60,
};

function CharCount({ value, max }) {
  const len = value ? value.length : 0;
  const over = len > max;
  return (
    <span style={{
      fontSize: '0.75rem',
      fontWeight: 600,
      color: over ? '#ef4444' : len >= max * 0.85 ? '#f59e0b' : 'var(--text-secondary)',
      float: 'right',
      marginTop: '4px',
    }}>
      {len}/{max}
    </span>
  );
}

export default function BannerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    background_color: '#f1f5f9',
    text_color: '#94a3b8',
    location: 'home_top'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchBanner();
    }
  }, [id]);

  const fetchBanner = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/banners/${id}`);
      if (data.success && data.data) {
        setFormData({
          title: data.data.title || '',
          subtitle: data.data.subtitle || '',
          description: data.data.description || '',
          image_url: data.data.image_url || '',
          background_color: data.data.background_color || '#f1f5f9',
          text_color: data.data.text_color || '#94a3b8',
          location: data.data.location || 'home_top'
        });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch banner details');
      navigate('/banners');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (formData.title.length > LIMITS.title) {
      newErrors.title = `Title must be ${LIMITS.title} characters or fewer.`;
    }
    if (formData.subtitle && formData.subtitle.length > LIMITS.subtitle) {
      newErrors.subtitle = `Subtitle must be ${LIMITS.subtitle} characters or fewer.`;
    }
    if (formData.description && formData.description.length > LIMITS.description) {
      newErrors.description = `Description must be ${LIMITS.description} characters or fewer.`;
    }
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const fileFormData = new FormData();
    fileFormData.append('image', file);

    setUploading(true);
    try {
      const { data } = await api.post('/upload?type=banners', fileFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (data.success) {
        setFormData(prev => ({ ...prev, image_url: data.data.url }));
      } else {
        alert(data.message || 'Failed to upload image');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      if (isEdit) {
        await api.put(`/banners/${id}`, formData);
      } else {
        await api.post('/banners', formData);
      }
      navigate('/banners');
    } catch (err) {
      console.error(err);
      alert(isEdit ? 'Failed to update banner' : 'Failed to create banner');
    }
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading banner details...</p>
      </div>
    );
  }

  const inputStyle = (field) => ({
    ...(errors[field] ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.12)' } : {})
  });

  return (
    <div className="page-content">
      <div style={{ marginBottom: '32px' }}>
        <Link to="/banners" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '16px', fontSize: '0.95rem' }}>
          <FiArrowLeft /> Back to Banners
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>{isEdit ? 'Edit Banner' : 'Add New Banner'}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{isEdit ? 'Modify properties and layout of this promotional banner' : 'Design a new banner advertisement'}</p>
      </div>

      <div className="glass-panel" style={{ padding: '32px', width: '100%', boxSizing: 'border-box' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          
          {/* Title */}
          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '4px', display: 'block' }}>
              Banner Title *
              <CharCount value={formData.title} max={LIMITS.title} />
            </label>
            <input 
              required 
              name="title" 
              value={formData.title} 
              onChange={handleInputChange} 
              className="input-field" 
              placeholder="e.g. Summer Super Sale"
              maxLength={LIMITS.title + 10}
              style={inputStyle('title')}
            />
            {errors.title && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontSize: '0.8rem', marginTop: '5px' }}>
                <FiAlertCircle size={13} /> {errors.title}
              </div>
            )}
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Max {LIMITS.title} characters</p>
          </div>

          {/* Subtitle */}
          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '4px', display: 'block' }}>
              Subtitle
              <CharCount value={formData.subtitle} max={LIMITS.subtitle} />
            </label>
            <input 
              name="subtitle" 
              value={formData.subtitle} 
              onChange={handleInputChange} 
              className="input-field" 
              placeholder="e.g. Get up to 50% Off"
              maxLength={LIMITS.subtitle + 10}
              style={inputStyle('subtitle')}
            />
            {errors.subtitle && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontSize: '0.8rem', marginTop: '5px' }}>
                <FiAlertCircle size={13} /> {errors.subtitle}
              </div>
            )}
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Max {LIMITS.subtitle} characters</p>
          </div>

          {/* Location */}
          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Location *</label>
            <CustomSelect 
              name="location" 
              value={formData.location} 
              onChange={handleInputChange} 
              isRequired={true}
              options={[
                { value: 'home_top', label: 'Home Page (Top)' },
                { value: 'home_middle', label: 'Home Page (Middle/Between Categories)' },
                { value: 'category_top', label: 'Category Page (Top)' }
              ]} 
            />
            <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {formData.location === 'home_top' && '🏠 Shown in carousel above category list'}
              {formData.location === 'home_middle' && '📦 Shown between category product rows'}
              {formData.location === 'category_top' && '🗂️ Shown at top of category browsing page'}
            </p>
          </div>

          {/* Image */}
          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Banner Image</label>
            {formData.image_url ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <img src={formData.image_url} alt="Banner Preview" style={{ width: '120px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                <button 
                  type="button" 
                  className="btn" 
                  style={{ padding: '8px 16px', fontSize: '0.9rem', color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)', background: 'transparent' }}
                  onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '36px 24px',
                textAlign: 'center',
                cursor: uploading ? 'default' : 'pointer',
                background: 'var(--bg-primary)',
                marginTop: '8px',
                position: 'relative',
                transition: 'border-color 0.2s ease'
              }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploading}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: uploading ? 'default' : 'pointer'
                  }} 
                />
                <FiImage style={{ fontSize: '2.5rem', color: 'var(--text-secondary)', marginBottom: '12px' }} />
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {uploading ? 'Uploading image...' : 'Click to select banner image'}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Only images up to 5MB are allowed
                </p>
              </div>
            )}
          </div>

          {/* Background Color */}
          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Background Color</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="color" 
                name="background_color" 
                value={formData.background_color} 
                onChange={handleInputChange} 
                style={{ width: '60px', height: '40px', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', padding: 0 }} 
              />
              <input 
                type="text" 
                name="background_color" 
                value={formData.background_color} 
                onChange={handleInputChange} 
                className="input-field" 
                style={{ flex: 1 }}
              />
            </div>
          </div>

          {/* Text Color */}
          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Text Color</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="color" 
                name="text_color" 
                value={formData.text_color} 
                onChange={handleInputChange} 
                style={{ width: '60px', height: '40px', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', padding: 0 }} 
              />
              <input 
                type="text" 
                name="text_color" 
                value={formData.text_color} 
                onChange={handleInputChange} 
                className="input-field" 
                style={{ flex: 1 }}
              />
            </div>
          </div>

          {/* Description — full width */}
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontWeight: 600, marginBottom: '4px', display: 'block' }}>
              Description
              <CharCount value={formData.description} max={LIMITS.description} />
            </label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              className="input-field" 
              rows="3"
              maxLength={LIMITS.description + 10}
              placeholder="Provide a description or terms for this campaign..."
              style={inputStyle('description')}
            ></textarea>
            {errors.description && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', fontSize: '0.8rem', marginTop: '5px' }}>
                <FiAlertCircle size={13} /> {errors.description}
              </div>
            )}
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Max {LIMITS.description} characters</p>
          </div>

          {/* Submit Row */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px', borderTop: '1px solid #cbd5e1', paddingTop: '24px' }}>
            <Link to="/banners" className="btn" style={{ textDecoration: 'none', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Cancel
            </Link>
            <button type="submit" disabled={uploading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiSave /> {isEdit ? 'Update Banner' : 'Save Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
