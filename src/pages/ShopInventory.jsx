import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FiCheckCircle, FiXCircle, FiImage } from 'react-icons/fi'
import api from '../api'

export default function ShopInventory({ shops }) {
  const { shopId } = useParams();
  const [inventory, setInventory] = useState([]);
  
  const activeShop = shops.find(s => s.id === parseInt(shopId));

  useEffect(() => {
    if (activeShop) {
      fetchInventory();
    }
  }, [activeShop]);

  const fetchInventory = async () => {
    try {
      const { data } = await api.get(`/shop-inventory/${shopId}`);
      if (data.success) {
        setInventory(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch shop inventory', error);
    }
  };

  const toggleAvailability = async (productId, currentStatus) => {
    // Optimistic UI update
    setInventory(prev => prev.map(item => 
      item.product_id === productId ? { ...item, is_available: !currentStatus } : item
    ));

    try {
      await api.put('/shop-inventory/toggle', {
        shopId: activeShop.id,
        productId: productId,
        isAvailable: !currentStatus
      });
      // Optionally refetch if needed, but optimistic update is usually enough
    } catch (err) {
      console.error(err);
      // Revert on error
      setInventory(prev => prev.map(item => 
        item.product_id === productId ? { ...item, is_available: currentStatus } : item
      ));
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>Shop Inventory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Managing catalog for: <strong>{activeShop ? activeShop.name : '...'}</strong></p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>MRP Price</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Availability Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.product_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.product_name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                          <FiImage />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.quantity} {item.quantity_type}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{item.category_name}</td>
                  <td style={{ fontWeight: 500 }}>₹{parseFloat(item.price).toFixed(2)}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      backgroundColor: item.is_available ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: item.is_available ? 'var(--accent-success)' : 'var(--accent-danger)'
                    }}>
                      {item.is_available ? <FiCheckCircle /> : <FiXCircle />}
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn" 
                      style={{ 
                        backgroundColor: item.is_available ? '#f1f5f9' : 'var(--accent-primary)',
                        color: item.is_available ? 'var(--text-primary)' : 'white',
                        border: item.is_available ? '1px solid #cbd5e1' : 'none',
                        minWidth: '150px',
                        justifyContent: 'center'
                      }}
                      onClick={() => toggleAvailability(item.product_id, item.is_available)}
                    >
                      {item.is_available ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                  </td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No global products found in the catalog.
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
