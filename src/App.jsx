import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import GlobalProducts from './pages/GlobalProducts'
import Categories from './pages/Categories'
import Banners from './pages/Banners'
import Orders from './pages/Orders'
import ManageShops from './pages/ManageShops'
import Login from './pages/Login'
import Users from './pages/Users'
import UserDetail from './pages/UserDetail'
import OrderDetail from './pages/OrderDetail'
import ManageCharges from './pages/ManageCharges'
import PaymentSettings from './pages/PaymentSettings'
import CategoryForm from './pages/CategoryForm'
import ProductForm from './pages/ProductForm'
import BannerForm from './pages/BannerForm'
import CustomerSupport from './pages/CustomerSupport'
import api from './api'
import { NotificationProvider } from './context/NotificationContext'

// Simple protected route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [shops, setShops] = useState([]);

  const fetchShops = async () => {
    try {
      const { data } = await api.get('/shops');
      if (data.success && data.data) {
        setShops(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch shops', err);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  return (
    <NotificationProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout shops={shops} />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="global-products" element={<GlobalProducts />} />
          <Route path="global-products/new" element={<ProductForm />} />
          <Route path="global-products/:id/edit" element={<ProductForm />} />
          <Route path="manage-shops" element={<ManageShops shops={shops} refreshShops={fetchShops} />} />
          <Route path="categories" element={<Categories />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/:id/edit" element={<CategoryForm />} />
          <Route path="banners" element={<Banners />} />
          <Route path="banners/new" element={<BannerForm />} />
          <Route path="banners/:id/edit" element={<BannerForm />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:userId" element={<UserDetail />} />
          <Route path="orders" element={<Orders shops={shops} />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />
          <Route path="manage-charges" element={<ManageCharges />} />
          <Route path="payment-settings" element={<PaymentSettings />} />
          <Route path="support-queries" element={<CustomerSupport activeTabProp="queries" />} />
          <Route path="social-links" element={<CustomerSupport activeTabProp="socials" />} />
          <Route path="contact-cards" element={<CustomerSupport activeTabProp="contact" />} />
        </Route>
      </Routes>
    </NotificationProvider>
  )
}

export default App
