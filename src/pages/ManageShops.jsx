import { useState, useEffect } from 'react'
import { FiSave, FiMapPin } from 'react-icons/fi'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet'
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
      map.flyTo([position.lat, position.lng], 13);
    }
  }, [position?.lat, position?.lng]);
  return null;
}

export default function ManageShops({ shops, refreshShops }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shopId, setShopId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: 'Vegpik Store',
    address: '',
    city: '',
    latitude: '',
    longitude: '',
    is_active: true,
    delivery_radius_km: 15
  });

  useEffect(() => {
    if (shops && shops.length > 0) {
      const shop = shops[0]; // Primary shop
      setShopId(shop.id);
      setFormData({
        name: shop.name,
        address: shop.address,
        city: shop.city,
        latitude: shop.latitude ? String(shop.latitude) : '',
        longitude: shop.longitude ? String(shop.longitude) : '',
        is_active: shop.is_active,
        delivery_radius_km: shop.delivery_radius_km ? parseFloat(shop.delivery_radius_km) : 15
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [shops]);

  const handleSetPosition = (pos) => {
    setFormData(prev => ({ ...prev, latitude: pos.lat.toFixed(6), longitude: pos.lng.toFixed(6) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        delivery_radius_km: parseFloat(formData.delivery_radius_km)
      };

      if (shopId) {
        const { data } = await api.put(`/shops/${shopId}`, payload);
        if (data.success) {
          alert('Shop details updated successfully!');
          if (refreshShops) refreshShops();
        }
      } else {
        const { data } = await api.post('/shops', payload);
        if (data.success) {
          alert('Shop details saved successfully!');
          if (refreshShops) refreshShops();
        }
      }
    } catch (error) {
      console.error('Failed to save shop details', error);
      alert(error.response?.data?.error || 'Failed to save shop details');
    } finally {
      setSaving(false);
    }
  };

  const markerPosition = formData.latitude && formData.longitude
    ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }
    : null;

  const mapCenter = markerPosition || { lat: 25.2048, lng: 55.2708 }; // Default Dubai

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading shop details...</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>Shop Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage the primary store location and delivery coverage</p>
      </div>

      <div className="glass-panel" style={{ padding: '32px', width: '100%' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Store Name</label>
            <input 
              required
              type="text" 
              value={formData.name} 
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} 
              className="input-field" 
              placeholder="Store Name"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="input-group">
              <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>City</label>
              <input 
                required
                type="text" 
                value={formData.city} 
                onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))} 
                className="input-field" 
                placeholder="City"
              />
            </div>
            
            <div className="input-group">
              <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Store Status</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '42px' }}>
                <input 
                  type="checkbox" 
                  checked={formData.is_active} 
                  onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))} 
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 500 }}>Store is Open</span>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Full Address</label>
            <textarea 
              required
              value={formData.address} 
              onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))} 
              className="input-field" 
              rows="3"
              placeholder="Full street address..."
            />
          </div>

          {/* Delivery Radius Section */}
          <div className="input-group" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '12px', padding: '20px' }}>
            <label style={{ fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}>
              🚚 Delivery Radius Management
            </label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Set the maximum delivery distance from the store. Orders from outside this radius will show "Out of Zone" to customers.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Radius</span>
                  <span style={{ 
                    fontWeight: 700, 
                    fontSize: '1.1rem',
                    color: 'var(--accent-primary)',
                    background: 'rgba(99, 102, 241, 0.1)',
                    padding: '2px 12px',
                    borderRadius: '20px'
                  }}>
                    {formData.delivery_radius_km} km
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="0.5"
                  value={formData.delivery_radius_km}
                  onChange={e => setFormData(prev => ({ ...prev, delivery_radius_km: parseFloat(e.target.value) }))}
                  style={{ 
                    width: '100%', 
                    accentColor: 'var(--accent-primary)',
                    cursor: 'pointer',
                    height: '6px'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>1 km</span>
                  <span>25 km</span>
                  <span>50 km</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[5, 10, 15, 25].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, delivery_radius_km: r }))}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: formData.delivery_radius_km === r ? 'var(--accent-primary)' : '#cbd5e1',
                      background: formData.delivery_radius_km === r ? 'var(--accent-primary)' : 'transparent',
                      color: formData.delivery_radius_km === r ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="input-group">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiMapPin /> Store Location & Delivery Coverage
            </label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Click on the map or drag the marker to set the store location. The blue circle shows the delivery radius.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <input 
                type="text" 
                placeholder="Latitude" 
                value={formData.latitude} 
                onChange={e => setFormData(prev => ({ ...prev, latitude: e.target.value }))} 
                className="input-field"
                required
              />
              <input 
                type="text" 
                placeholder="Longitude" 
                value={formData.longitude} 
                onChange={e => setFormData(prev => ({ ...prev, longitude: e.target.value }))} 
                className="input-field"
                required
              />
            </div>
            
            <div style={{ height: '380px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
              <MapContainer 
                center={mapCenter} 
                zoom={11} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <MapController position={mapCenter} />
                <LocationMarker 
                  position={markerPosition}
                  setPosition={handleSetPosition} 
                />
                {markerPosition && (
                  <Circle
                    center={markerPosition}
                    radius={formData.delivery_radius_km * 1000} // convert km → meters
                    pathOptions={{
                      color: '#6366f1',
                      fillColor: '#6366f1',
                      fillOpacity: 0.08,
                      weight: 2,
                      dashArray: '6 4'
                    }}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px' }}>
              <FiSave /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
