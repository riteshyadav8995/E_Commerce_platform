import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import NotificationBell from '../components/admin/NotificationBell';
import {
  LayoutDashboard,
  Tag,
  Package,
  Warehouse,
  LogOut,
  User,
  Menu,
  X,
  ShoppingBag,
  Receipt,
  BarChart2,
  PackageX,
} from 'lucide-react';

const navItems = [
  { to: '/',        label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/products',   label: 'Products',   icon: Package },
  { to: '/inventory',  label: 'Inventory',  icon: Warehouse },
  { to: '/billing/pos',label: 'POS / Billing', icon: Receipt },
  { to: '/reports',    label: 'Reports',    icon: BarChart2 },
  { to: '/staff',      label: 'Staff',      icon: User },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/returns', label: 'Returns', icon: PackageX },
];

const NavLink = ({ to, label, icon: Icon, onClick }) => {
  const location = useLocation();
  const isActive =
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary-600 text-white dark:bg-primary-700'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </Link>
  );
};

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden print:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-200 ease-in-out flex flex-col print:hidden transition-colors ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary-600" />
            <span className="font-bold text-gray-900 dark:text-white text-lg">ShopAdmin</span>
          </div>
          <button
            className="lg:hidden text-gray-400 dark:text-gray-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              {...item}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* User section */}
        {isAuthenticated && (
          <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-3">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="truncate text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 print:w-full">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between gap-3 print:hidden min-h-[60px] transition-colors">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary-600" />
              <span className="font-bold text-gray-900 dark:text-white">ShopAdmin</span>
            </div>
          </div>
          {/* Push to right on desktop */}
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto print:p-0 print:overflow-visible">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
