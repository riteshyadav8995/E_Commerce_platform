import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, Package } from 'lucide-react';
import { getInventoryByProduct, getStockHistory } from '../../services/inventoryService';
import PageHeader from '../../components/ui/PageHeader';

const typeMeta = {
  IN: {
    label: 'Stock In',
    icon: TrendingUp,
    color: 'text-green-600 bg-green-50',
    sign: '+',
  },
  OUT: {
    label: 'Stock Out',
    icon: TrendingDown,
    color: 'text-red-600 bg-red-50',
    sign: '-',
  },
  ADJUSTMENT: {
    label: 'Adjustment',
    icon: RefreshCw,
    color: 'text-blue-600 bg-blue-50',
    sign: '→',
  },
};

const StockHistory = () => {
  const { productId } = useParams();
  const [inventory, setInventory] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 20;

  useEffect(() => {
    getInventoryByProduct(productId)
      .then((res) => setInventory(res.data))
      .catch(() => setError('Could not load inventory details'));
  }, [productId]);

  useEffect(() => {
    setLoading(true);
    getStockHistory(productId, { page, limit })
      .then((res) => {
        setTransactions(res.data.transactions);
        setTotal(res.data.total);
      })
      .catch(() => setError('Could not load history'))
      .finally(() => setLoading(false));
  }, [productId, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PageHeader
        title="Stock History"
        subtitle={inventory ? `${inventory.product?.name} · SKU: ${inventory.product?.sku}` : 'Loading...'}
        action={
          <Link
            to="/inventory"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inventory
          </Link>
        }
      />

      {/* Product summary card */}
      {inventory && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6 flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            {inventory.product?.imageUrl ? (
              <img src={inventory.product.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-800">{inventory.product?.name}</p>
              <p className="text-sm text-gray-400">{inventory.product?.category?.name}</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-gray-400">Current Stock</p>
              <p className={`text-2xl font-bold ${inventory.isLowStock ? 'text-red-600' : 'text-gray-800'}`}>
                {inventory.quantity}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Purchase Price</p>
              <p className="text-xl font-semibold text-gray-700">₹{parseFloat(inventory.purchasePrice).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400">Min Threshold</p>
              <p className="text-xl font-semibold text-gray-700">{inventory.minStockThreshold}</p>
            </div>
            <div>
              <p className="text-gray-400">Selling Price</p>
              <p className="text-xl font-semibold text-gray-700">₹{parseFloat(inventory.product?.price).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-sm">Transaction Log</h2>
          <span className="text-xs text-gray-400">{total} total entries</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No transactions recorded yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx) => {
              const meta = typeMeta[tx.type] || typeMeta.IN;
              const Icon = meta.icon;
              return (
                <div key={tx.id} className="px-5 py-3.5 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${meta.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${meta.color.split(' ')[0]}`}>
                        {meta.sign}{tx.quantity} units
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                        {meta.label}
                      </span>
                    </div>
                    {tx.reason && (
                      <p className="text-xs text-gray-500 mt-0.5">{tx.reason}</p>
                    )}
                    {tx.user && (
                      <p className="text-xs text-gray-400">by {tx.user.name}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                    {new Date(tx.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockHistory;
