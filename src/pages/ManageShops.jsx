import { useState, useEffect } from 'react'
import { FiPlus, FiMapPin, FiX, FiCheckCircle, FiXCircle, FiTrash2 } from 'react-icons/fi'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import api from '../api'

// Fix leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker 
      position={position} 
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          setPosition(marker.getLatLng());
        },
      }}
    />
  );
}

// Flies the map view to a new position when it changes
function MapController({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && position.lat && position.lng) {
      map.flyTo([position.lat, position.lng], 15);
    }
  }, [position?.lat, position?.lng]);
  return null;
}

export default function ManageShops({ shops, refreshShops }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingShopId, setEditingShopId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    latitude: '',
    longitude: '',
    is_active: true
  });

  const handleSetPosition = (pos) => {
    setFormData({ ...formData, latitude: pos.lat.toFixed(6), longitude: pos.lng.toFixed(6) });
  };

  const handleOpenAddModal = () => {
    setEditingShopId(null);
    setFormData({ name: '', address: '', city: '', latitude: '', longitude: '', is_active: true });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (shop) => {
    setEditingShopId(shop.id);
    setFormData({
      name: shop.name,
      address: shop.address,
      city: shop.city,
      latitude: shop.latitude ? String(shop.latitude) : '',
      longitude: shop.longitude ? String(shop.longitude) : '',
      is_active: shop.is_active
    });
    setShowAddModal(true);
  };

  const handleDeleteShop = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the shop "${name}"? This will also cascade delete all associated inventory, carts, and orders.`)) {
      return;
    }
    try {
      const { data } = await api.delete(`/shops/${id}`);
      if (data.success) {
        if (refreshShops) refreshShops();
      }
    } catch (error) {
      console.error('Failed to delete shop', error);
      alert(error.response?.data?.error || 'Failed to delete shop');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        latitude: formData.latitude ? parseFloat(formData.latitude) : 0,
        longitude: formData.longitude ? parseFloat(formData.longitude) : 0,
        is_active: formData.is_active
      };
      
      let response;
      if (editingShopId) {
        response = await api.put(`/shops/${editingShopId}`, payload);
      } else {
        response = await api.post('/shops', payload);
      }
      
      if (response.data.success) {
        if (refreshShops) refreshShops(); // Update global state
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Failed to save shop', error);
      alert(error.response?.data?.errors?.[0]?.msg || error.response?.data?.error || 'Failed to save shop');
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>Manage Shops</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Global physical store locations</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <FiPlus /> Add New Shop
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Shop Name</th>
                <th>Location</th>
                <th>Coordinates</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shops?.map(shop => (
                <tr key={shop.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiMapPin />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600 }}>{shop.name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {shop.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p>{shop.address}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{shop.city}</p>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {shop.latitude}, {shop.longitude}
                  </td>
                  <td>
                    {shop.is_active ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#dcfce7', color: '#166534', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 500 }}>
                        <FiCheckCircle /> Active
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 500 }}>
                        <FiXCircle /> Inactive
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary" onClick={() => handleOpenEditModal(shop)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Edit</button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDeleteShop(shop.id, shop.name)} 
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!shops || shops.length === 0) && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No shops found. Create one to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{editingShopId ? 'Edit Shop Location' : 'Add New Shop Location'}</h3>
              <button onClick={() => setShowAddModal(false)} style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label className="form-label">Shop Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Downtown Central"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="form-label">Address</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="e.g. 123 Main St"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="form-label">City</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="e.g. New York"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="form-label">Location on Map (Click or Drag Pin)</label>
                <div style={{ height: '250px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', zIndex: 0 }}>
                  <MapContainer center={[28.6139, 77.2090]} zoom={12} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      maxZoom={19}
                    />
                    <LocationMarker 
                      position={formData.latitude && formData.longitude ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) } : null} 
                      setPosition={handleSetPosition} 
                    />
                    <MapController 
                      position={formData.latitude && formData.longitude ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) } : null} 
                    />
                  </MapContainer>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                  <div style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Lat: {formData.latitude || 'Not set'}
                  </div>
                  <div style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Lng: {formData.longitude || 'Not set'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input 
                  type="checkbox" 
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                <label style={{ color: 'var(--text-secondary)' }}>Is Currently Active</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingShopId ? 'Update Shop' : 'Create Shop'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
