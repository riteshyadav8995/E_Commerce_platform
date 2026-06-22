import React, { useState } from 'react';
import { X } from 'lucide-react';
import { initializeInventory } from '../../services/inventoryService';

const InitializeInventoryModal = ({ products, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    productId: '',
    quantity: '0',
    purchasePrice: '0',
    minStockThreshold: '5',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId) {
      setError('Please select a product');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await initializeInventory({
        productId: parseInt(form.productId),
        quantity: parseInt(form.quantity),
        purchasePrice: parseFloat(form.purchasePrice),
        minStockThreshold: parseInt(form.minStockThreshold),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize inventory');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Initialize Stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product <span className="text-red-500">*</span>
            </label>
            {products.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                All products are already tracked in inventory.
              </p>
            ) : (
              <select name="productId" value={form.productId} onChange={handleChange} className={inputClass}>
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opening Qty</label>
              <input
                name="quantity"
                type="number"
                min="0"
                value={form.quantity}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buy Price (₹)</label>
              <input
                name="purchasePrice"
                type="number"
                min="0"
                step="0.01"
                value={form.purchasePrice}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
              <input
                name="minStockThreshold"
                type="number"
                min="0"
                value={form.minStockThreshold}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || products.length === 0}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Initializing...' : 'Initialize Inventory'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InitializeInventoryModal;
