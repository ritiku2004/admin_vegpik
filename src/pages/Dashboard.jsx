import { useState, useEffect } from 'react'
import { FiBox, FiTrendingUp, FiShoppingBag, FiUsers } from 'react-icons/fi'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'
import api from '../api'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const STATUS_COLORS = {
  'Processing': '#f59e0b',
  'Shipped': '#3b82f6',
  'Delivered': '#10b981',
  'Cancelled': '#ef4444'
};

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState('overall');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    activeOrders: 0,
    productsAvailable: 0,
    newCustomers: 0,
    chartData: [],
    categoryData: [],
    orderStatusData: [],
    topProductsData: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/dashboard/stats?timeframe=${timeframe}`);
        if (data.success && data.data) {
          setStats(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [timeframe]);

  const displayStats = [
    { title: 'Total Revenue', value: `₹${(stats?.revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, icon: <FiTrendingUp />, color: 'var(--accent-primary)' },
    { title: 'Total Orders', value: (stats?.totalSales || 0).toLocaleString(), icon: <FiShoppingBag />, color: 'var(--accent-warning)' },
    { title: 'Active Orders', value: (stats?.activeOrders || 0).toLocaleString(), icon: <FiBox />, color: '#ef4444' },
    { title: 'Products In Stock', value: (stats?.productsAvailable || 0).toLocaleString(), icon: <FiBox />, color: 'var(--accent-success)' },
    { title: 'New Customers', value: (stats?.newCustomers || 0).toLocaleString(), icon: <FiUsers />, color: '#8b5cf6' },
  ];

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Overview for <strong>All Shops</strong></p>
        </div>
        
        {/* Timeframe Toggles */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
          {['week', '15days', 'month', 'overall'].map((tf) => (
            <button 
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                color: timeframe === tf ? '#ffffff' : '#64748b',
                background: timeframe === tf ? 'var(--accent-primary)' : 'transparent',
                boxShadow: timeframe === tf ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {tf === 'week' ? '7 Days' : tf === '15days' ? '15 Days' : tf === 'month' ? '1 Month' : 'Overall'}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px'
      }}>
        {displayStats.map((stat, i) => (
          <div 
            key={i} 
            className="glass-panel" 
            style={{ 
              padding: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              gridColumn: stat.title === 'Total Revenue' ? 'span 2' : 'auto'
            }}
          >
            <div style={{
              width: '56px', height: '56px',
              borderRadius: '16px',
              backgroundColor: `${stat.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: stat.color,
              fontSize: '1.8rem'
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 500 }}>{stat.title}</p>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>
                {loading ? '...' : stat.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart Section */}
      <div className="glass-panel" style={{ padding: '32px', marginTop: '32px', height: '400px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '24px' }}>Revenue Trends</h3>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            Loading chart data...
          </div>
        ) : stats.chartData && stats.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickMargin={10} minTickGap={20} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `₹${value}`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`₹${parseFloat(value).toFixed(2)}`, 'Revenue']}
                labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '8px' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--accent-primary)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--accent-primary)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            No revenue data available for this timeframe.
          </div>
        )}
      </div>
      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginTop: '24px' }}>
        
        {/* Category Sales Donut */}
        <div className="glass-panel" style={{ padding: '24px', height: '350px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Sales by Category</h3>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>Loading...</div>
          ) : stats.categoryData && stats.categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`₹${parseFloat(value).toFixed(2)}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>No category data.</div>
          )}
        </div>

        {/* Order Status Donut */}
        <div className="glass-panel" style={{ padding: '24px', height: '350px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Order Fulfillment</h3>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>Loading...</div>
          ) : stats.orderStatusData && stats.orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, 'Orders']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>No order data.</div>
          )}
        </div>

        {/* Top Products Bar Chart */}
        <div className="glass-panel" style={{ padding: '24px', height: '350px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Top 5 Products</h3>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>Loading...</div>
          ) : stats.topProductsData && stats.topProductsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topProductsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.substring(0, 10) + '...'} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  formatter={(value) => [value, 'Units Sold']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="sales" fill="var(--accent-primary)" radius={[4, 4, 0, 0]}>
                  {stats.topProductsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>No product data.</div>
          )}
        </div>
      </div>
    </div>
  )
}
