import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Tag, Package, TrendingUp, Warehouse, AlertTriangle,
  Receipt, BarChart2, ShoppingCart, Plus, ArrowRight,
} from 'lucide-react';
import { getDashboardStats } from '../services/reportsService';
import useAuthStore from '../store/authStore';

const StatCard = ({ icon: Icon, label, value, sub, color, bg, to }) => (
  <Link
    to={to}
    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all group"
  >
    <div className="flex items-start justify-between">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
    </div>
    <div className="mt-4">
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  </Link>
);

const QuickAction = ({ to, icon: Icon, iconColor, label, desc }) => (
  <Link
    to={to}
    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
  >
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconColor} bg-opacity-10 flex-shrink-0`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
    </div>
    <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
  </Link>
);

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) =>
    `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {user?.name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Here's your store overview for today.</p>
      </div>

      {/* Revenue KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Today's Revenue"
          value={loading ? '…' : fmt(stats?.today?.revenue)}
          sub={loading ? '' : `${stats?.today?.count ?? 0} bill(s)`}
          color="text-primary-600 dark:text-primary-400"
          bg="bg-primary-100 dark:bg-primary-900/30"
          to="/reports"
        />
        <StatCard
          icon={Receipt}
          label="This Month"
          value={loading ? '…' : fmt(stats?.month?.revenue)}
          sub={loading ? '' : `${stats?.month?.count ?? 0} bills`}
          color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-100 dark:bg-emerald-900/30"
          to="/billing"
        />
        <StatCard
          icon={Package}
          label="Active Products"
          value={loading ? '…' : stats?.totalProducts}
          color="text-blue-600 dark:text-blue-400"
          bg="bg-blue-100 dark:bg-blue-900/30"
          to="/products"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Alerts"
          value={loading ? '…' : stats?.lowStockCount}
          sub="Below minimum threshold"
          color={stats?.lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}
          bg={stats?.lowStockCount > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'}
          to="/inventory"
        />
      </div>

      {/* Quick Actions + Top Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3">Quick Actions</h2>
          <div className="space-y-1">
            <QuickAction
              to="/billing/pos"
              icon={ShoppingCart}
              iconColor="bg-primary-500 text-primary-600"
              label="New Sale"
              desc="Open POS terminal"
            />
            <QuickAction
              to="/products/new"
              icon={Plus}
              iconColor="bg-blue-500 text-blue-600"
              label="Add Product"
              desc="Create a new product listing"
            />
            <QuickAction
              to="/inventory"
              icon={Warehouse}
              iconColor="bg-teal-500 text-teal-600"
              label="Manage Inventory"
              desc="Adjust stock levels"
            />
            <QuickAction
              to="/reports"
              icon={BarChart2}
              iconColor="bg-purple-500 text-purple-600"
              label="View Reports"
              desc="Sales analytics & trends"
            />
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 transition-colors">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3">System Status</h2>
          <div className="space-y-3">
            {[
              { label: 'Authentication & Users',  done: true },
              { label: 'Product & Category Mgmt', done: true },
              { label: 'Inventory Management',    done: true },
              { label: 'POS / Billing',           done: true },
              { label: 'Reports & Analytics',     done: true },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{label}</span>
                <span className={`flex items-center gap-1 font-medium ${done ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                  {done ? '✓ Active' : '⏳ Soon'}
                </span>
              </div>
            ))}
          </div>

          {/* Recent Bills summary */}
          {stats?.today?.count > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Today's summary</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-bold text-primary-600 dark:text-primary-400">{stats.today.count}</span> bill{stats.today.count !== 1 ? 's' : ''} ·{' '}
                <span className="font-bold text-gray-900 dark:text-white">{fmt(stats.today.revenue)}</span> collected
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
