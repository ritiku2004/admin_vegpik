import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiSearch, FiPhone, FiMail, FiCalendar, FiTrash2, FiEye } from 'react-icons/fi';
import api from '../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const { data } = await api.delete(`/users/${id}`);
      if (data.success) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete user', err);
      alert('Failed to delete user. Please try again.');
    }
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const phone = (user.phone_number || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || phone.includes(query) || email.includes(query);
  });

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>Users</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and view registered customers</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            color: 'var(--accent-primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            <FiUsers />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', marginBottom: '4px' }}>Total Registered</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{users.length}</h3>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
          <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '48px' }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading users...</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User Info</th>
                  <th>Email</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          overflow: 'hidden'
                        }}>
                          {user.profile_picture_url ? (
                            <img src={user.profile_picture_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            `${(user.first_name || 'U').charAt(0)}${(user.last_name || '').charAt(0)}`.toUpperCase()
                          )}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, margin: 0 }}>
                            {user.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Unnamed Customer'}
                          </p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                            ID: #{user.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                        <FiMail style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }} />
                        <span>{user.email || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <FiCalendar style={{ fontSize: '0.9rem' }} />
                        <span>{new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => navigate(`/users/${user.id}`)}
                          className="btn-primary"
                          style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: 'none', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', cursor: 'pointer', transition: 'all 0.2s' }}
                          title="View User Details"
                        >
                          <FiEye style={{ fontSize: '1.1rem' }} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="btn-danger"
                          style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }}
                          title="Delete User"
                        >
                          <FiTrash2 style={{ fontSize: '1.1rem' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
