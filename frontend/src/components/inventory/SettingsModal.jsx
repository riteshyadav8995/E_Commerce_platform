import React, { useState } from 'react';
import { X } from 'lucide-react';
import { updateInventorySettings } from '../../services/inventoryService';

const SettingsModal = ({ inventory, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    purchasePrice: String(inventory.purchasePrice),
    minStockThreshold: String(inventory.minStockThreshold),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateInventorySettings(inventory.productId, {
        purchasePrice: parseFloat(form.purchasePrice),
        minStockThreshold: parseInt(form.minStockThreshold),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Inventory Settings</h2>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (₹)</label>
            <input
              name="purchasePrice"
              type="number"
              min="0"
              step="0.01"
              value={form.purchasePrice}
              onChange={handleChange}
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">Cost price per unit (for margin calculation)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
            <input
              name="minStockThreshold"
              type="number"
              min="0"
              value={form.minStockThreshold}
              onChange={handleChange}
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">Alert when stock drops to or below this level</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
