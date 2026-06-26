import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiTag } from 'react-icons/fi'
import api from '../api'

export default function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>Categories</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage product categories</p>
        </div>
        <Link to="/categories/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <FiPlus /> Add Category
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Description</th>
                <th>Sequence</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontSize: '1.2rem' }}>
                          <FiTag />
                        </div>
                      )}
                      <span style={{ fontWeight: 600 }}>{cat.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{cat.description || '-'}</td>
                  <td>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      background: 'rgba(59, 130, 246, 0.1)', 
                      color: 'var(--accent-primary)', 
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}>
                      {cat.sequence ?? 0}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/categories/${cat.id}/edit`} className="icon-btn" style={{ color: 'var(--accent-primary)', marginRight: '12px', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center' }}>
                      <FiEdit2 />
                    </Link>
                    <button className="icon-btn" onClick={() => handleDelete(cat.id)} style={{ color: 'var(--accent-danger)', fontSize: '1.1rem' }}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No categories found.
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
