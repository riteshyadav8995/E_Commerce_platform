import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import CustomerLayout from './layouts/CustomerLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import CategoryList from './pages/categories/CategoryList';
import CategoryForm from './pages/categories/CategoryForm';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import InventoryList from './pages/inventory/InventoryList';
import StockHistory from './pages/inventory/StockHistory';
import POSTerminal from './pages/billing/POSTerminal';
import BillList from './pages/billing/BillList';
import BillDetail from './pages/billing/BillDetail';
import ReportsDashboard from './pages/reports/ReportsDashboard';
import StaffManagement from './pages/admin/StaffManagement';
import ReturnRequests from './pages/admin/ReturnRequests';
import Orders from './pages/admin/Orders';
import Storefront from './pages/customer/Storefront';
import ProductDetail from './pages/customer/ProductDetail';
import OrderSuccess from './pages/customer/OrderSuccess';
import TrackOrder from './pages/customer/TrackOrder';
import DeliveryFeedback from './pages/customer/DeliveryFeedback';
import MyOrders from './pages/customer/MyOrders';
import OrderDetails from './pages/customer/OrderDetails';
import PrintableOrderSummary from './pages/customer/PrintableOrderSummary';
import NewAddress from './pages/customer/NewAddress';
import StaticPage from './pages/customer/StaticPage';
import Shop from './pages/customer/Shop';
import About from './pages/customer/About';
import useAuthStore from './store/authStore';
import ScrollToTop from './components/ScrollToTop';
import DeliveryLayout from './layouts/DeliveryLayout';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'Customer') return <Navigate to="/store" replace />;
  return children;
};

const CustomerRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Allow admins to also view the store if they want, or strictly restrict. Let's allow admins to see it too, but they default to dashboard.
  return children;
};

const RoleBasedRedirect = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'Admin' || user?.role === 'Cashier') {
    return <Navigate to="/dashboard" replace />;
  }
  if (user?.role === 'DeliveryBoy') {
    return <Navigate to="/delivery" replace />;
  }
  return <Navigate to="/store" replace />;
};

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <ScrollToTop />
      <Routes>
        {/* Public / Redirect */}
        <Route path="/" element={<RoleBasedRedirect />} />

        {/* Auth pages */}
        <Route element={<AuthLayout />}>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Admin / Staff Pages */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/profile"   element={<AdminRoute><Profile /></AdminRoute>} />

          <Route path="/categories"          element={<AdminRoute><CategoryList /></AdminRoute>} />
          <Route path="/categories/new"      element={<AdminRoute><CategoryForm /></AdminRoute>} />
          <Route path="/categories/:id/edit" element={<AdminRoute><CategoryForm /></AdminRoute>} />

          <Route path="/products"          element={<AdminRoute><ProductList /></AdminRoute>} />
          <Route path="/products/new"      element={<AdminRoute><ProductForm /></AdminRoute>} />
          <Route path="/products/:id/edit" element={<AdminRoute><ProductForm /></AdminRoute>} />

          <Route path="/inventory"                     element={<AdminRoute><InventoryList /></AdminRoute>} />
          <Route path="/inventory/:productId/history"  element={<AdminRoute><StockHistory /></AdminRoute>} />

          <Route path="/billing/pos" element={<AdminRoute><POSTerminal /></AdminRoute>} />
          <Route path="/billing"     element={<AdminRoute><BillList /></AdminRoute>} />
          <Route path="/billing/:id" element={<AdminRoute><BillDetail /></AdminRoute>} />

          <Route path="/reports" element={<AdminRoute><ReportsDashboard /></AdminRoute>} />
          <Route path="/staff" element={<AdminRoute><StaffManagement /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><Orders /></AdminRoute>} />
          <Route path="/admin/returns" element={<AdminRoute><ReturnRequests /></AdminRoute>} />
        </Route>

        {/* Customer Pages */}
        <Route element={<CustomerLayout />}>
          <Route path="/store" element={<Storefront />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/order-success/:billNumber" element={<OrderSuccess />} />
          <Route path="/track-order/:billNumber" element={<TrackOrder />} />
          <Route path="/order-details/:billNumber" element={<OrderDetails />} />
          <Route path="/print-order-summary/:billNumber" element={<PrintableOrderSummary />} />
          <Route path="/delivery-feedback/:billNumber" element={<DeliveryFeedback />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/address/new" element={<NewAddress />} />
          <Route path="/page/:pageId" element={<StaticPage />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Delivery Portal */}
        <Route element={<DeliveryLayout />}>
          <Route path="/delivery" element={<DeliveryDashboard />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<RoleBasedRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
