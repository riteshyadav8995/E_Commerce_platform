import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Settings,
  History,
  Search,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { getAllInventory } from '../../services/inventoryService';
import { getProducts } from '../../services/productService';
import PageHeader from '../../components/ui/PageHeader';
import InitializeInventoryModal from '../../components/inventory/InitializeInventoryModal';
import AdjustStockModal from '../../components/inventory/AdjustStockModal';
import SettingsModal from '../../components/inventory/SettingsModal';

const StockBar = ({ quantity, threshold }) => {
  const pct = threshold > 0 ? Math.min((quantity / (threshold * 3)) * 100, 100) : 100;
  const isLow = quantity <= threshold;
  const color = isLow
    ? 'bg-red-500'
    : quantity <= threshold * 1.5
    ? 'bg-yellow-400'
    : 'bg-green-500';
  return (
    <div className="w-24">
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [filterLow, setFilterLow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [initModal, setInitModal] = useState(false);
  const [adjustModal, setAdjustModal] = useState(null); // inventory row
  const [settingsModal, setSettingsModal] = useState(null); // inventory row

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllInventory(filterLow ? { lowStock: true } : {});
      setInventory(res.data);
    } catch {
      setError('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }, [filterLow]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    getProducts({ limit: 200 })
      .then((res) => setProducts(res.data))
      .catch(() => {});
  }, []);

  // Products that don't yet have inventory records
  const uninitializedProducts = products.filter(
    (p) => !inventory.some((inv) => inv.productId === p.id)
  );

  const filtered = inventory.filter((inv) =>
    inv.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    inv.product?.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = inventory.filter((inv) => inv.isLowStock).length;

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle={
          lowStockCount > 0
            ? `${lowStockCount} item${lowStockCount > 1 ? 's' : ''} low on stock`
            : 'All stock levels healthy'
        }
        action={
          <button
            onClick={() => setInitModal(true)}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Initialize Stock
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: 'Total Products',
            value: inventory.length,
            icon: Package,
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400',
          },
          {
            label: 'Low Stock',
            value: lowStockCount,
            icon: AlertTriangle,
            color: lowStockCount > 0 ? 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400' : 'text-gray-500 bg-gray-50 dark:bg-gray-700 dark:text-gray-400',
          },
          {
            label: 'Total Units',
            value: inventory.reduce((a, b) => a + b.quantity, 0),
            icon: TrendingUp,
            color: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400',
          },
          {
            label: 'Untracked',
            value: uninitializedProducts.length,
            icon: TrendingDown,
            color: uninitializedProducts.length > 0 ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400' : 'text-gray-500 bg-gray-50 dark:bg-gray-700 dark:text-gray-400',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 flex items-center gap-3 transition-colors">
            <div className={`p-2 rounded-lg ${color.split(' ').slice(1).join(' ')}`}>
              <Icon className={`w-5 h-5 ${color.split(' ')[0]}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setFilterLow((v) => !v)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
            filterLow
              ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
              : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          {filterLow ? 'Show All' : 'Low Stock Only'}
        </button>
        <button
          onClick={fetchInventory}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 dark:text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 py-16 flex flex-col items-center text-gray-400 dark:text-gray-500 transition-colors">
          <Package className="w-10 h-10 mb-3" />
          <p className="text-sm">
            {inventory.length === 0
              ? 'No inventory records yet. Click "Initialize Stock" to get started.'
              : 'No results match your search.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                {['Product', 'SKU', 'Category', 'Stock Level', 'Qty', 'Purchase Price', 'Min Threshold', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${inv.isLowStock ? 'bg-red-50/40 dark:bg-red-900/20' : ''}`}
                >
                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {inv.product?.imageUrl ? (
                        <img src={inv.product.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{inv.product?.name}</p>
                        {inv.isLowStock && (
                          <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Low stock
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{inv.product?.sku}</td>

                  {/* Category */}
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{inv.product?.category?.name || '—'}</td>

                  {/* Stock bar */}
                  <td className="px-4 py-3">
                    <StockBar quantity={inv.quantity} threshold={inv.minStockThreshold} />
                  </td>

                  {/* Quantity */}
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${inv.isLowStock ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {inv.quantity}
                    </span>
                  </td>

                  {/* Purchase Price */}
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    ₹{parseFloat(inv.purchasePrice).toFixed(2)}
                  </td>

                  {/* Min Threshold */}
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{inv.minStockThreshold}</td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAdjustModal(inv)}
                        title="Adjust stock"
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-md transition-colors"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/inventory/${inv.productId}/history`}
                        title="View history"
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                      >
                        <History className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setSettingsModal(inv)}
                        title="Settings"
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {initModal && (
        <InitializeInventoryModal
          products={uninitializedProducts}
          onClose={() => setInitModal(false)}
          onSuccess={() => { setInitModal(false); fetchInventory(); }}
        />
      )}
      {adjustModal && (
        <AdjustStockModal
          inventory={adjustModal}
          onClose={() => setAdjustModal(null)}
          onSuccess={() => { setAdjustModal(null); fetchInventory(); }}
        />
      )}
      {settingsModal && (
        <SettingsModal
          inventory={settingsModal}
          onClose={() => setSettingsModal(null)}
          onSuccess={() => { setSettingsModal(null); fetchInventory(); }}
        />
      )}
    </div>
  );
};

export default InventoryList;
