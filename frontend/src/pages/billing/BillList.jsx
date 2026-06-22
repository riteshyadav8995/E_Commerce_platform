import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt, Search, Filter, ChevronLeft, ChevronRight,
  Eye, XCircle, Calendar, TrendingUp,
} from 'lucide-react';
import * as billingService from '../../services/billingService';

const STATUS_COLORS = {
  PAID:      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};
const MODE_COLORS = {
  CASH: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  CARD: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  UPI:  'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  LINK: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
};
const P_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  PAID: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  FAILED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};
const S_STATUS_COLORS = {
  PENDING: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  PACKED: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  SHIPPED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  DELIVERED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
};

export default function BillList() {
  const [bills, setBills]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [filters, setFilters] = useState({ status: '', paymentMode: '', from: '', to: '' });
  const limit = 15;

  const loadBills = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await billingService.getAllBills(params);
      setBills(res.data.bills);
      setTotal(res.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { loadBills(); }, [loadBills]);

  const totalPages = Math.ceil(total / limit);

  const filterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing History</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{total} total bills</p>
        </div>
        <Link
          to="/billing/pos"
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors shadow-lg shadow-primary-100"
        >
          <Receipt className="w-4 h-4" /> New Bill
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-4 transition-colors">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-36">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => filterChange('status', e.target.value)}
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="">All</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="flex-1 min-w-36">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Payment Mode</label>
            <select
              value={filters.paymentMode}
              onChange={(e) => filterChange('paymentMode', e.target.value)}
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="">All</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
          <div className="flex-1 min-w-36">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">From</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => filterChange('from', e.target.value)}
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <div className="flex-1 min-w-36">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">To</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => filterChange('to', e.target.value)}
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
          <button
            onClick={() => { setFilters({ status: '', paymentMode: '', from: '', to: '' }); setPage(1); }}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
            <Receipt className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No bills found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  {['Bill #', 'Date', 'Items', 'Total', 'Payment', 'Order Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">{bill.billNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 ml-5">
                        {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {bill.items.length} item{bill.items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900 dark:text-white">₹{parseFloat(bill.grandTotal).toFixed(2)}</span>
                      {parseFloat(bill.discount) > 0 && (
                        <span className="text-xs text-red-400 ml-1.5">−₹{parseFloat(bill.discount).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full self-start ${MODE_COLORS[bill.paymentMode] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                          {bill.paymentMode}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full self-start ${P_STATUS_COLORS[bill.paymentStatus] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                          {bill.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full self-start ${STATUS_COLORS[bill.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                          {bill.status}
                        </span>
                        {bill.shippingStatus !== 'N/A' && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full self-start ${S_STATUS_COLORS[bill.shippingStatus] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                            {bill.shippingStatus}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/billing/${bill.id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 transition-colors">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages} ({total} bills)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
