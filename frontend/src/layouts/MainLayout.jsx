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
  ChevronLeft,
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

const NavLink = ({ to, label, icon: Icon, onClick, collapsed }) => {
  const location = useLocation();
  const isActive =
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-[#2874f0] text-white shadow-sm'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      } ${collapsed ? 'justify-center lg:px-0' : ''}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
    </Link>
  );
};

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden print:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 bg-slate-900 border-r border-slate-800 z-50 transform transition-all duration-300 ease-in-out flex flex-col print:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${!desktopSidebarOpen ? 'lg:w-20' : 'w-64'}`}
      >
        {/* Logo */}
        <div className={`flex items-center px-5 py-4 border-b border-slate-800 overflow-hidden ${!desktopSidebarOpen ? 'lg:justify-center lg:px-0' : 'justify-between'}`}>
          <div className={`flex items-center gap-2 ${!desktopSidebarOpen ? 'lg:hidden' : ''}`}>
            <ShoppingBag className="w-6 h-6 text-[#2874f0] shrink-0" />
            <span className="font-bold text-white text-lg tracking-tight truncate">LuxeStore Admin</span>
          </div>
          
          {/* Collapsed Icon Logo */}
          {!desktopSidebarOpen && (
            <div className="hidden lg:flex items-center justify-center w-full">
              <ShoppingBag className="w-8 h-8 text-[#2874f0]" />
            </div>
          )}

          <div className={`flex items-center gap-1 shrink-0 ${!desktopSidebarOpen ? 'lg:hidden' : ''}`}>
            <button
              className="lg:hidden text-slate-400 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <button
              className="hidden lg:flex items-center justify-center p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              onClick={() => setDesktopSidebarOpen(false)}
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              {...item}
              collapsed={!desktopSidebarOpen}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* User section */}
        {isAuthenticated && (
          <div className={`border-t border-slate-800 px-3 py-3 overflow-hidden ${!desktopSidebarOpen ? 'lg:px-2' : ''}`}>
            <Link
              to="/profile"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 transition-colors ${!desktopSidebarOpen ? 'lg:justify-center lg:px-0' : ''}`}
              title={!desktopSidebarOpen ? user?.name : undefined}
            >
              <div className="w-8 h-8 shrink-0 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <User className="w-4 h-4 text-slate-300" />
              </div>
              <div className={`min-w-0 ${!desktopSidebarOpen ? 'lg:hidden' : ''}`}>
                <p className="truncate font-medium text-white">{user?.name}</p>
                <p className="truncate text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className={`mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors ${!desktopSidebarOpen ? 'lg:justify-center lg:px-0' : ''}`}
              title={!desktopSidebarOpen ? 'Logout' : undefined}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className={!desktopSidebarOpen ? 'lg:hidden' : ''}>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 print:w-full">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between gap-3 print:hidden min-h-[60px] transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSidebarOpen(true);
                setDesktopSidebarOpen(true);
              }}
              className={`text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 ${
                desktopSidebarOpen ? 'lg:hidden' : 'lg:flex'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className={`flex items-center gap-2 ${desktopSidebarOpen ? 'lg:hidden' : 'lg:flex'}`}>
              <ShoppingBag className="w-5 h-5 text-primary-600" />
              <span className="font-bold text-gray-900 dark:text-white tracking-tight">LuxeStore Admin</span>
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
