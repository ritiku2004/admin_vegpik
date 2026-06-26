import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiImage, FiSave } from 'react-icons/fi'
import api from '../api'

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    sequence: 0
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/categories/${id}`);
      if (data.success && data.data) {
        setFormData({
          name: data.data.name || '',
          description: data.data.description || '',
          image_url: data.data.image_url || '',
          sequence: data.data.sequence !== undefined ? data.data.sequence : 0
        });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch category details');
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Hard block category name beyond 15 characters, but allow deleting characters if it's already over 15
    if (name === 'name' && value.length > 15 && value.length > (formData.name || '').length) return;
    setFormData({ ...formData, [name]: value });
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
      const { data } = await api.post('/upload?type=categories', fileFormData, {
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
    // Validate category name length
    if (!formData.name.trim()) {
      alert('Category name is required.');
      return;
    }
    if (formData.name.trim().length > 15) {
      alert('Category name must be 15 characters or less to fit on the app.');
      return;
    }
    const payload = {
      ...formData,
      sequence: parseInt(formData.sequence, 10) || 0
    };
    try {
      if (isEdit) {
        await api.put(`/categories/${id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      navigate('/categories');
    } catch (err) {
      console.error(err);
      alert(isEdit ? 'Failed to update category' : 'Failed to create category');
    }
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading category details...</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div style={{ marginBottom: '32px' }}>
        <Link to="/categories" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '16px', fontSize: '0.95rem' }}>
          <FiArrowLeft /> Back to Categories
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>{isEdit ? 'Edit Category' : 'Add New Category'}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{isEdit ? 'Update details and photo for this category' : 'Create a new product category'}</p>
      </div>

      <div className="glass-panel" style={{ padding: '32px', width: '100%', boxSizing: 'border-box' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Category Name *</label>
            <input 
              required 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              className="input-field" 
              placeholder="e.g. Fruits & Vegetables"
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '6px' 
            }}>
              <span style={{ 
                fontSize: '0.78rem', 
                color: formData.name.length >= 15 ? '#ef4444' : formData.name.length >= 12 ? '#f97316' : 'var(--text-secondary)'
              }}>
                {formData.name.length >= 15 
                  ? '⚠️ Maximum length reached — names must fit in the app card'
                  : 'Category name must be 15 characters or less'}
              </span>
              <span style={{ 
                fontSize: '0.82rem', 
                fontWeight: 700,
                color: formData.name.length >= 15 ? '#ef4444' : formData.name.length >= 12 ? '#f97316' : 'var(--text-secondary)'
              }}>
                {formData.name.length}/15
              </span>
            </div>
          </div>

          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Category Image</label>
            {formData.image_url ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <img src={formData.image_url} alt="Category Preview" style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
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
                  {uploading ? 'Uploading image...' : 'Click to select category image'}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Only images up to 5MB are allowed
                </p>
              </div>
            )}
          </div>

          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Sequence Order</label>
            <input 
              type="number"
              name="sequence" 
              value={formData.sequence} 
              onChange={handleInputChange} 
              className="input-field" 
              placeholder="e.g. 1"
              min="0"
            />
            <div style={{ marginTop: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Determines the display order in the app (lower numbers appear first).
              </span>
            </div>
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              className="input-field" 
              rows="4"
              placeholder="Provide a description for this category..."
            ></textarea>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px', borderTop: '1px solid #cbd5e1', paddingTop: '24px' }}>
            <Link to="/categories" className="btn" style={{ textDecoration: 'none', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Cancel
            </Link>
            <button type="submit" disabled={uploading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiSave /> {isEdit ? 'Update Category' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
