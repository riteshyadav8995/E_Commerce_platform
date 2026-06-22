import React, { useState, useEffect } from 'react';
import {
  TrendingUp, ShoppingBag, Receipt, AlertTriangle,
  Package, Tag, BarChart2, ArrowUp, ArrowDown,
  RefreshCw, Award, Sparkles,
} from 'lucide-react';
import { getDashboardStats, getAiSummary } from '../../services/reportsService';

// ── Simple bar chart using pure CSS/SVG ──────────────────────────────────────
function BarChart({ data, valueKey, labelKey, color = '#6366f1' }) {
  if (!data?.length) return <p className="text-sm text-gray-400 text-center py-8">No data yet</p>;
  const max = Math.max(...data.map((d) => d[valueKey]));
  return (
    <div className="flex items-end gap-1.5 h-32 w-full">
      {data.map((item, i) => {
        const pct = max ? (item[valueKey] / max) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div
              className="w-full rounded-t-md transition-all duration-700 relative cursor-pointer"
              style={{ height: `${Math.max(pct, 2)}%`, background: color, opacity: 0.85 }}
              title={`${item[labelKey]}: ₹${typeof item[valueKey] === 'number' ? item[valueKey].toFixed(2) : item[valueKey]}`}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                ₹{typeof item[valueKey] === 'number' ? item[valueKey].toFixed(0) : item[valueKey]}
              </div>
            </div>
            <span className="text-[10px] text-gray-400 truncate w-full text-center">
              {item[labelKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Donut chart using SVG ─────────────────────────────────────────────────────
function DonutChart({ data }) {
  if (!data?.length) return <p className="text-sm text-gray-400 text-center py-8">No data yet</p>;
  const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];
  const total = data.reduce((s, d) => s + d.revenue, 0);
  let cumulative = 0;
  const segments = data.map((d, i) => {
    const pct = total ? d.revenue / total : 0;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const r = 40, cx = 50, cy = 50;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = pct > 0.5 ? 1 : 0;
    return { d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`, color: COLORS[i % COLORS.length], name: d.name, pct };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-32 h-32 flex-shrink-0">
        {segments.map((seg, i) => (
          <path key={i} d={seg.d} fill={seg.color} stroke="white" strokeWidth="1" />
        ))}
        <circle cx="50" cy="50" r="22" fill="white" />
      </svg>
      <div className="flex-1 space-y-1.5">
        {segments.slice(0, 6).map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="text-xs text-gray-600 flex-1 truncate">{seg.name}</span>
            <span className="text-xs font-semibold text-gray-800">{(seg.pct * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ title, value, subtitle, icon: Icon, color, trend }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Main Report Page ──────────────────────────────────────────────────────────
export default function ReportsDashboard() {
  const [stats, setStats]     = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    setAiSummary(null);
    try {
      const res = await getDashboardStats();
      setStats(res.data);
      getAiSummary().then(aiRes => setAiSummary(aiRes.data.summary)).catch(() => setAiSummary("Failed to generate AI insights."));
    } catch (e) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">{error}</p>
        <button onClick={load} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const dailyLabels = stats.dailyRevenue.map((d) => {
    const date = new Date(d.date);
    return date.toLocaleDateString('en-IN', { weekday: 'short' });
  });

  const dailyForChart = stats.dailyRevenue.map((d, i) => ({
    ...d,
    label: dailyLabels[i],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Business performance overview</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* AI Insights Card */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="font-bold text-gray-900">AI Executive Summary</h2>
        </div>
        <div className="text-sm text-gray-700 leading-relaxed italic">
          {aiSummary ? `"${aiSummary}"` : <span className="animate-pulse text-gray-400">Analyzing latest data...</span>}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Revenue Today"
          value={fmt(stats.today.revenue)}
          subtitle={`${stats.today.count} bill${stats.today.count !== 1 ? 's' : ''}`}
          icon={TrendingUp}
          color="bg-primary-100 text-primary-600"
        />
        <KPICard
          title="This Week"
          value={fmt(stats.week.revenue)}
          subtitle={`${stats.week.count} bills`}
          icon={Receipt}
          color="bg-emerald-100 text-emerald-600"
        />
        <KPICard
          title="This Month"
          value={fmt(stats.month.revenue)}
          subtitle={`${stats.month.count} bills`}
          icon={ShoppingBag}
          color="bg-blue-100 text-blue-600"
        />
        <KPICard
          title="All Time"
          value={fmt(stats.total.revenue)}
          subtitle={`${stats.total.count} bills total`}
          icon={BarChart2}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard
          title="Active Products"
          value={stats.totalProducts}
          icon={Package}
          color="bg-indigo-100 text-indigo-600"
        />
        <KPICard
          title="Categories"
          value={stats.totalCategories}
          icon={Tag}
          color="bg-cyan-100 text-cyan-600"
        />
        <KPICard
          title="Low Stock Alerts"
          value={stats.lowStockCount}
          subtitle="Below min threshold"
          icon={AlertTriangle}
          color={`${stats.lowStockCount > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Revenue — Last 7 Days</h2>
          <BarChart data={dailyForChart} valueKey="revenue" labelKey="label" color="#6366f1" />
          <div className="mt-3 flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
            <span>7-day total: {fmt(stats.week.revenue)}</span>
            <span>{stats.week.count} bills</span>
          </div>
        </div>

        {/* Category Pie */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Revenue by Category</h2>
          <DonutChart data={stats.categoryRevenue} />
          {stats.categoryRevenue.length === 0 && (
            <p className="text-xs text-gray-400 text-center mt-2">No sales recorded yet</p>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-gray-800">Top Products by Sales</h2>
        </div>
        {stats.topProducts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No sales data yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats.topProducts.map((product, i) => {
              const maxQty = stats.topProducts[0]?.totalQty || 1;
              const barPct = (product.totalQty / maxQty) * 100;
              return (
                <div key={product.productId} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="w-6 text-sm font-bold text-gray-300">#{i + 1}</span>
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Package className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{product.totalQty} units</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">{fmt(product.totalRevenue)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
