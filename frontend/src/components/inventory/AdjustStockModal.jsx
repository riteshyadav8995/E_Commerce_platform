import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { adjustStock } from '../../services/inventoryService';

const typeConfig = {
  IN: {
    label: 'Stock In',
    icon: TrendingUp,
    color: 'bg-green-50 border-green-200 text-green-700',
    active: 'bg-green-500 text-white border-green-500',
    description: 'Add stock (purchase / receipt)',
  },
  OUT: {
    label: 'Stock Out',
    icon: TrendingDown,
    color: 'bg-red-50 border-red-200 text-red-700',
    active: 'bg-red-500 text-white border-red-500',
    description: 'Remove stock (damage / write-off)',
  },
  ADJUSTMENT: {
    label: 'Adjustment',
    icon: RefreshCw,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    active: 'bg-blue-500 text-white border-blue-500',
    description: 'Set exact stock count',
  },
};

const AdjustStockModal = ({ inventory, onClose, onSuccess }) => {
  const [type, setType] = useState('IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || parseInt(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await adjustStock(inventory.productId, {
        type,
        quantity: parseInt(quantity),
        reason: reason.trim() || null,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  const previewQty =
    type === 'IN'
      ? inventory.quantity + (parseInt(quantity) || 0)
      : type === 'OUT'
      ? inventory.quantity - (parseInt(quantity) || 0)
      : parseInt(quantity) || inventory.quantity;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Adjust Stock</h2>
            <p className="text-sm text-gray-500">{inventory.product?.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
          )}

          {/* Current stock info */}
          <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">Current stock</span>
            <span className="font-bold text-gray-800 text-lg">{inventory.quantity} units</span>
          </div>

          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(typeConfig).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const isActive = type === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setType(key)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-xs font-medium transition-all ${
                      isActive ? cfg.active : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1">{typeConfig[type].description}</p>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'ADJUSTMENT' ? 'New Quantity' : 'Quantity'}
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={type === 'ADJUSTMENT' ? 'Enter exact stock count' : 'Enter quantity'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Preview */}
          {quantity && (
            <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between text-sm">
              <span className="text-blue-600">Stock after adjustment</span>
              <span className={`font-bold text-lg ${previewQty < 0 ? 'text-red-600' : 'text-blue-700'}`}>
                {previewQty} units
              </span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Purchase from supplier, Damaged goods..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Applying...' : 'Apply Adjustment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdjustStockModal;
