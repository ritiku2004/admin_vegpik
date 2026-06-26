import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi'
import api from '../api'
import CustomSelect from '../components/CustomSelect'

export default function GlobalProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      if (data.success) setProducts(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this global product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = !search || 
      (product.name && product.name.toLowerCase().includes(search.toLowerCase())) ||
      (product.brand && product.brand.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !selectedCategory || String(product.category_id) === String(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>Global Products</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Master catalog of all available products</p>
        </div>
        <Link to="/global-products/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <FiPlus /> Add Global Product
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div className="input-group" style={{ flex: '1 1 250px', margin: 0, flexDirection: 'row', alignItems: 'center', background: 'var(--bg-primary)', borderRadius: '8px', padding: '0 16px', border: '1px solid #cbd5e1' }}>
            <FiSearch style={{ color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field" 
              style={{ flex: 1, background: 'transparent', border: 'none', boxShadow: 'none' }} 
            />
          </div>
          <CustomSelect 
            name="filter_category" 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)} 
            placeholder="All Categories"
            style={{ flex: '1 1 200px', minWidth: '200px' }}
            options={[{value: '', label: 'All Categories'}, ...categories.map(cat => ({ value: cat.id, label: cat.name }))]} 
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Brand</th>
                 <th>Price</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                          <FiImage />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{product.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{product.quantity} {product.quantity_type}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{product.category_name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{product.brand || '-'}</td>
                  <td style={{ fontWeight: 500 }}>
                    {parseFloat(product.discount_percentage) > 0 ? (
                      <div>
                        <div style={{ textDecoration: 'line-through', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          MRP: ₹{parseFloat(product.mrp_price).toFixed(2)}
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          ₹{((parseFloat(product.mrp_price) || 0) * (1 - (parseFloat(product.discount_percentage) || 0) / 100)).toFixed(2)}
                          <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#16a34a', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {parseFloat(product.discount_percentage)}% OFF
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontWeight: 600 }}>₹{parseFloat(product.mrp_price).toFixed(2)}</div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/global-products/${product.id}/edit`} className="icon-btn" style={{ color: 'var(--accent-primary)', marginRight: '12px', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center' }}>
                      <FiEdit2 />
                    </Link>
                    <button className="icon-btn" onClick={() => handleDelete(product.id)} style={{ color: 'var(--accent-danger)', fontSize: '1.1rem' }}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No products found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
