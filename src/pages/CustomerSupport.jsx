import { useState, useEffect } from 'react'
import api from '../api'

export default function CustomerSupport({ activeTabProp = 'queries' }) {
  const [activeTab, setActiveTab] = useState(activeTabProp)
  const [queries, setQueries] = useState([])
  const [socialLinks, setSocialLinks] = useState([])
  const [contactInfo, setContactInfo] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Modals / forms state
  const [editingSocial, setEditingSocial] = useState(null) // { id, name, icon, link } or 'new'
  const [editingContact, setEditingContact] = useState(null) // { id, title, description, value, action_label, icon }

  const fetchData = async () => {
    setLoading(true)
    setMessage('')
    try {
      if (activeTab === 'queries') {
        const { data } = await api.get('/support/queries')
        if (data.success) setQueries(data.data)
      } else if (activeTab === 'socials') {
        const { data } = await api.get('/support/social-links')
        if (data.success) setSocialLinks(data.data)
      } else if (activeTab === 'contact') {
        const { data } = await api.get('/support/contact-info')
        if (data.success) setContactInfo(data.data)
      }
    } catch (err) {
      console.error(err)
      setMessage('Failed to load support information')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setActiveTab(activeTabProp);
  }, [activeTabProp]);

  useEffect(() => {
    fetchData()
  }, [activeTab])

  // Query actions
  const handleResolveQuery = async (id) => {
    try {
      const { data } = await api.put(`/support/queries/${id}/status`, { status: 'Resolved' })
      if (data.success) {
        setQueries(queries.map(q => q.id === id ? { ...q, status: 'Resolved' } : q))
      }
    } catch (err) {
      console.error(err)
      alert('Failed to resolve query')
    }
  }

  // Social link actions
  const handleSaveSocial = async (e) => {
    e.preventDefault()
    try {
      if (editingSocial.id) {
        // Update
        const { data } = await api.put(`/support/social-links/${editingSocial.id}`, editingSocial)
        if (data.success) {
          setSocialLinks(socialLinks.map(s => s.id === editingSocial.id ? editingSocial : s))
          setEditingSocial(null)
        }
      } else {
        // Create
        const { data } = await api.post('/support/social-links', editingSocial)
        if (data.success) {
          fetchData()
          setEditingSocial(null)
        }
      }
    } catch (err) {
      console.error(err)
      alert('Failed to save social link')
    }
  }

  const handleDeleteSocial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this social link?')) return
    try {
      const { data } = await api.delete(`/support/social-links/${id}`)
      if (data.success) {
        setSocialLinks(socialLinks.filter(s => s.id !== id))
      }
    } catch (err) {
      console.error(err)
      alert('Failed to delete social link')
    }
  }

  // Contact info actions
  const handleSaveContact = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.put(`/support/contact-info/${editingContact.id}`, editingContact)
      if (data.success) {
        setContactInfo(contactInfo.map(c => c.id === editingContact.id ? editingContact : c))
        setEditingContact(null)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to update contact detail')
    }
  }

  return (
    <div className="page-container" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            {activeTab === 'queries' ? 'Support Queries' : activeTab === 'socials' ? 'Social Links' : 'Contact Cards'}
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {activeTab === 'queries' ? 'View and manage customer support queries.' : activeTab === 'socials' ? 'Manage your social media links.' : 'Manage your contact details and cards.'}
          </p>
        </div>
      </div>

      {message && <div style={{ color: 'var(--accent-danger)', marginBottom: '16px' }}>{message}</div>}

      {/* TABS CONTAINER */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          {/* TAB 1: QUERIES */}
          {activeTab === 'queries' && (
            <div className="table-container glass-panel">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '16px' }}>Date</th>
                    <th style={{ padding: '16px' }}>Name</th>
                    <th style={{ padding: '16px' }}>Contact Details</th>
                    <th style={{ padding: '16px' }}>Subject</th>
                    <th style={{ padding: '16px' }}>Message Details</th>
                    <th style={{ padding: '16px' }}>Status</th>
                    <th style={{ padding: '16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queries.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No queries found.
                      </td>
                    </tr>
                  ) : (
                    queries.map((q) => (
                      <tr key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.88rem' }}>
                        <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                          {new Date(q.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{q.name}</td>
                        <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                          <div>{q.email}</div>
                          <div style={{ fontSize: '0.78rem', marginTop: '2px', color: 'var(--text-muted)' }}>{q.phone}</div>
                        </td>
                        <td style={{ padding: '16px', fontWeight: 500 }}>
                          <span style={{ textTransform: 'capitalize' }}>{q.subject}</span>
                        </td>
                        <td style={{ padding: '16px', maxWidth: '320px', whiteSpace: 'pre-wrap', color: 'var(--text-primary)', lineHeight: 1.4 }}>{q.message}</td>
                        <td style={{ padding: '16px' }}>
                          <span className="badge" style={{
                            background: q.status === 'Resolved' ? 'rgba(34,197,94,0.12)' : 'rgba(248,113,113,0.12)',
                            color: q.status === 'Resolved' ? 'var(--accent-success)' : 'var(--accent-danger)',
                            border: `1px solid ${q.status === 'Resolved' ? 'rgba(34,197,94,0.2)' : 'rgba(248,113,113,0.2)'}`
                          }}>
                            {q.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          {q.status !== 'Resolved' && (
                            <button
                              onClick={() => handleResolveQuery(q.id)}
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: SOCIAL LINKS */}
          {activeTab === 'socials' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button
                  onClick={() => setEditingSocial({ name: '', icon: 'Facebook', link: '' })}
                  className="btn btn-primary"
                >
                  + Add Social Link
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {socialLinks.map((s) => (
                  <div key={s.id} className="glass-panel" style={{ padding: '24px', transition: 'var(--transition-normal)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px' }}
                       onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                       onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{s.name}</h4>
                        {s.icon && (s.icon.includes('/') || s.icon.includes('.')) ? (
                          <img 
                            src={s.icon.startsWith('http') ? s.icon : `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1').replace('/api/v1', '')}/${s.icon.replace(/^\//, '')}`} 
                            alt={s.name} 
                            style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '4px' }} 
                            onError={(e) => {
                              if (e.target.src.includes('media.vegpik.com')) {
                                e.target.src = e.target.src.replace(/https?:\/\/media\.vegpik\.com/gi, `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1').replace('/api/v1', '')}/uploads`);
                              } else {
                                e.target.outerHTML = `<span style="font-size:0.75rem">${s.icon}</span>`;
                              }
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', background: 'rgba(34,197,94,0.1)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(34,197,94,0.2)' }}>
                            {s.icon}
                          </span>
                        )}
                      </div>
                      <div style={{ wordBreak: 'break-all', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
                        {s.link}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => setEditingSocial(s)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSocial(s.id)}
                        className="btn btn-danger"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT INFO */}
          {activeTab === 'contact' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {contactInfo.map((c) => (
                <div key={c.id} className="glass-panel" style={{ padding: '24px', transition: 'var(--transition-normal)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '260px' }}
                     onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                     onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{c.title}</h4>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', tracking: '0.05em' }}>{c.field_key}</span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>{c.description}</p>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '12px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <strong style={{ color: 'var(--text-muted)' }}>Value:</strong> <span style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>{c.value || 'N/A'}</span>
                      </div>
                      {c.action_label && (
                        <div style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                          <strong style={{ color: 'var(--text-muted)' }}>Action:</strong> <span style={{ color: 'var(--accent-info)', marginLeft: '4px', wordBreak: 'break-all' }}>{c.action_label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingContact(c)}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Edit Card Settings
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SOCIAL MODAL/FORM */}
      {editingSocial && (
        <div className="modal-overlay">
          <form onSubmit={handleSaveSocial} className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>
              {editingSocial.id ? 'Edit Social Link' : 'Add Social Link'}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div className="input-group">
                <label>Display Name</label>
                <input
                  type="text" className="input-field" value={editingSocial.name} required
                  onChange={(e) => setEditingSocial({ ...editingSocial, name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Icon Image</label>
                {editingSocial.icon && (
                  <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={editingSocial.icon.startsWith('http') ? editingSocial.icon : `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1').replace('/api/v1', '')}/${editingSocial.icon.replace(/^\//, '')}`} 
                      alt="Preview" 
                      style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--glass-border)', padding: '4px', background: 'rgba(255,255,255,0.05)' }} 
                      onError={(e) => {
                        // If it fails, fallback to local host port if it was media.vegpik.com locally, or vice versa
                        if (e.target.src.includes('media.vegpik.com')) {
                          e.target.src = e.target.src.replace(/https?:\/\/media\.vegpik\.com/gi, `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1').replace('/api/v1', '')}/uploads`);
                        } else {
                          e.target.src = 'https://placehold.co/40x40?text=Icon';
                        }
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>Icon uploaded successfully</span>
                  </div>
                )}
                <input
                  type="file" 
                  accept="image/*"
                  className="input-field"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    
                    const formData = new FormData();
                    formData.append('image', file);
                    
                    try {
                      // Upload file using axios upload helper
                      const { data } = await api.post('/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                      });
                      if (data.success && data.data && data.data.url) {
                        setEditingSocial({ ...editingSocial, icon: data.data.url });
                      }
                    } catch (err) {
                      console.error('Upload failed:', err);
                      alert('Failed to upload icon image');
                    }
                  }}
                />
              </div>

              <div className="input-group">
                <label>Redirect Link / URL</label>
                <input
                  type="url" className="input-field" value={editingSocial.link} required
                  onChange={(e) => setEditingSocial({ ...editingSocial, link: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button" onClick={() => setEditingSocial(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONTACT INFO MODAL/FORM */}
      {editingContact && (
        <div className="modal-overlay">
          <form onSubmit={handleSaveContact} className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>
              Edit Card: {editingContact.title}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div className="input-group">
                <label>Card Title</label>
                <input
                  type="text" className="input-field" value={editingContact.title} required
                  onChange={(e) => setEditingContact({ ...editingContact, title: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Card Description / Subtitle</label>
                <textarea
                  className="input-field" value={editingContact.description || ''} rows="3"
                  onChange={(e) => setEditingContact({ ...editingContact, description: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Display Value</label>
                <input
                  type="text" className="input-field" value={editingContact.value || ''}
                  onChange={(e) => setEditingContact({ ...editingContact, value: e.target.value })}
                />
              </div>

              {editingContact.field_key !== 'operating_hours' && (
                <div className="input-group">
                  <label>Action Destination Link (tel:, mailto:, or URL)</label>
                  <input
                    type="text" className="input-field" value={editingContact.action_label || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, action_label: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button" onClick={() => setEditingContact(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
