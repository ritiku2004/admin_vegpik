import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiImage, FiSave } from 'react-icons/fi'
import api from '../api'
import CustomSelect from '../components/CustomSelect'

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    brand: '',
    mrp_price: '',
    discount_percentage: '0.00',
    quantity: '',
    quantity_type: 'piece',
    sku: '',
    image_url: '',
    is_active: true
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${id}`);
      if (data.success && data.data) {
        setFormData({
          name: data.data.name || '',
          category_id: data.data.category_id || '',
          description: data.data.description || '',
          brand: data.data.brand || '',
          mrp_price: data.data.mrp_price || '',
          discount_percentage: data.data.discount_percentage !== undefined ? String(data.data.discount_percentage) : '0.00',
          quantity: data.data.quantity || '',
          quantity_type: data.data.quantity_type || 'piece',
          sku: data.data.sku || '',
          image_url: data.data.image_url || '',
          is_active: data.data.is_active !== undefined ? data.data.is_active : true
        });
        setFeatures(data.data.features || []);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch product details');
      navigate('/global-products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFeatureChange = (index, field, value) => {
    const updated = [...features];
    updated[index][field] = value;
    setFeatures(updated);
  };

  const addFeature = () => {
    setFeatures([...features, { feature_name: '', feature_value: '' }]);
  };

  const removeFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
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
      const { data } = await api.post('/upload?type=products', fileFormData, {
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
    try {
      const payload = {
        ...formData,
        category_id: parseInt(formData.category_id),
        mrp_price: parseFloat(formData.mrp_price),
        discount_percentage: parseFloat(formData.discount_percentage || 0),
        quantity: parseFloat(formData.quantity),
        features: features.filter(f => f.feature_name.trim() !== '' && f.feature_value.trim() !== '')
      };

      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      navigate('/global-products');
    } catch (err) {
      console.error(err);
      alert(isEdit ? 'Failed to update product' : 'Failed to create product');
    }
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div style={{ marginBottom: '32px' }}>
        <Link to="/global-products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '16px', fontSize: '0.95rem' }}>
          <FiArrowLeft /> Back to Global Products
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{isEdit ? 'Update core parameters and image for this catalog product' : 'Introduce a new global catalog product'}</p>
      </div>

      <div className="glass-panel" style={{ padding: '32px', width: '100%', boxSizing: 'border-box' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Product Name *</label>
            <input 
              required 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              className="input-field" 
              placeholder="e.g. Red Tomatoes"
            />
          </div>

          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Category *</label>
            <CustomSelect 
              name="category_id" 
              value={formData.category_id} 
              onChange={handleInputChange} 
              isRequired={true}
              placeholder="Select Category..."
              options={categories.map(cat => ({ value: cat.id, label: cat.name }))} 
            />
          </div>

          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Brand</label>
            <input 
              name="brand" 
              value={formData.brand} 
              onChange={handleInputChange} 
              className="input-field" 
              placeholder="e.g. Local Farm"
            />
          </div>

          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>MRP Price *</label>
            <input 
              required 
              type="number" 
              step="0.01" 
              name="mrp_price" 
              value={formData.mrp_price} 
              onChange={handleInputChange} 
              className="input-field" 
              placeholder="0.00"
            />
          </div>

          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Discount (%)</label>
            <input 
              type="number" 
              step="0.01" 
              min="0"
              max="100"
              name="discount_percentage" 
              value={formData.discount_percentage} 
              onChange={handleInputChange} 
              className="input-field" 
              placeholder="0.00"
            />
          </div>

          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Selling Price (Preview)</label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              height: '42px', 
              padding: '0 16px', 
              borderRadius: '8px', 
              background: '#f1f5f9', 
              border: '1px solid #cbd5e1', 
              fontWeight: 600,
              color: 'var(--text-primary)'
            }}>
              ₹{((parseFloat(formData.mrp_price) || 0) * (1 - (parseFloat(formData.discount_percentage) || 0) / 100)).toFixed(2)}
            </div>
          </div>

          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>SKU</label>
            <input 
              name="sku" 
              value={formData.sku} 
              onChange={handleInputChange} 
              className="input-field" 
              placeholder="e.g. SKU-TOMATO"
            />
          </div>

          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Quantity Value *</label>
            <input 
              required 
              type="number" 
              step="0.01" 
              name="quantity" 
              value={formData.quantity} 
              onChange={handleInputChange} 
              className="input-field" 
              placeholder="1"
            />
          </div>

          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Quantity Type *</label>
            <CustomSelect 
              name="quantity_type" 
              value={formData.quantity_type} 
              onChange={handleInputChange} 
              isRequired={true}
              options={['kg', 'g', 'mg', 'l', 'ml', 'piece', 'pack', 'dozen'].map(t => ({ value: t, label: t }))} 
            />
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Product Image</label>
            {formData.image_url ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <img src={formData.image_url} alt="Product Preview" style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
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
                  {uploading ? 'Uploading image...' : 'Click to select product image'}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Only images up to 5MB are allowed
                </p>
              </div>
            )}
          </div>

          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #cbd5e1', paddingTop: '24px', marginTop: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>Product Specifications</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {features.map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="Specification Title (e.g. Shelf Life)" 
                    value={feature.feature_name}
                    onChange={(e) => handleFeatureChange(idx, 'feature_name', e.target.value)}
                    className="input-field"
                    style={{ flex: 1 }}
                  />
                  <input 
                    type="text" 
                    placeholder="Specification Detail (e.g. 5 days)" 
                    value={feature.feature_value}
                    onChange={(e) => handleFeatureChange(idx, 'feature_value', e.target.value)}
                    className="input-field"
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    onClick={() => removeFeature(idx)}
                    className="btn"
                    style={{ padding: '10px 16px', color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)', background: 'transparent' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <button 
                type="button" 
                onClick={addFeature}
                className="btn btn-secondary"
                style={{ width: 'fit-content', marginTop: '8px' }}
              >
                Add Specification
              </button>
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
              placeholder="Provide a description for this product..."
            ></textarea>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px', borderTop: '1px solid #cbd5e1', paddingTop: '24px' }}>
            <Link to="/global-products" className="btn" style={{ textDecoration: 'none', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Cancel
            </Link>
            <button type="submit" disabled={uploading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiSave /> {isEdit ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
