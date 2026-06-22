import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Receipt, Package, User, Calendar,
  CreditCard, XCircle, CheckCircle, AlertTriangle, Printer,
} from 'lucide-react';
import * as billingService from '../../services/billingService';

import * as userService from '../../services/userService';

const STATUS_CONFIG = {
  PAID:      { label: 'Paid',      icon: CheckCircle, cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  CANCELLED: { label: 'Cancelled', icon: XCircle,     cls: 'text-red-600 bg-red-50 border-red-200' },
};
const MODE_CONFIG = {
  CASH: { label: 'Cash',  cls: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30' },
  CARD: { label: 'Card',  cls: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' },
  UPI:  { label: 'UPI',   cls: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30' },
  LINK: { label: 'Link',  cls: 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' },
};

export default function BillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill]             = useState(null);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [error, setError]           = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [trackingForm, setTrackingForm] = useState({ status: '', location: '', message: '' });

  useEffect(() => {
    if (bill && !trackingForm.status) {
      setTrackingForm(prev => ({ ...prev, status: bill.shippingStatus }));
    }
  }, [bill]);

  useEffect(() => {
    Promise.all([
      billingService.getBillById(id),
      userService.getUsers({ role: 'DeliveryBoy' }).catch(() => ({ data: [] }))
    ])
      .then(([billRes, usersRes]) => {
        setBill(billRes.data);
        setDeliveryBoys(usersRes.data);
      })
      .catch(() => setError('Bill not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    setError('');
    try {
      const res = await billingService.cancelBill(id);
      setBill(res.data);
      setShowConfirm(false);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to cancel bill');
    } finally {
      setCancelling(false);
    }
  };

  const handleMarkPaid = async () => {
    setMarkingPaid(true);
    setError('');
    try {
      const res = await billingService.markPaid(id);
      setBill(res.data.bill || res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to mark as paid');
    } finally {
      setMarkingPaid(false);
    }
  };

  const submitTrackingUpdate = async () => {
    try {
      const res = await billingService.updateShippingStatus(id, trackingForm.status, trackingForm.location, trackingForm.message);
      setBill(res.data);
      setTrackingForm(prev => ({ ...prev, location: '', message: '' }));
      alert("Tracking updated successfully!");
    } catch (err) {
      alert("Failed to update shipping status");
    }
  };

  const handleAssignDelivery = async (e) => {
    const deliveryBoyId = e.target.value;
    try {
      const res = await billingService.assignDeliveryBoy(id, deliveryBoyId);
      setBill(res.data);
    } catch (err) {
      alert("Failed to assign delivery boy");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !bill) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
        <button onClick={() => navigate('/billing')} className="mt-4 text-primary-600 underline">
          Back to Bills
        </button>
      </div>
    );
  }

  const status = STATUS_CONFIG[bill.status] || STATUS_CONFIG.PAID;
  const StatusIcon = status.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-5 print:max-w-none print:w-full print:p-8 print:bg-white print:m-0 print:border-none">
      {/* Print Header (Visible only in print) */}
      <div className="hidden print:flex justify-between items-end border-b pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
          <p className="text-sm text-gray-500">#{bill.billNumber}</p>
        </div>
        <div className="text-right text-sm text-gray-600">
          <p className="font-bold text-gray-900">ShopAdmin Inc.</p>
          <p>Date: {new Date(bill.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Back + Title */}
      <div className="flex items-center gap-3 print:hidden">
        <button
          onClick={() => navigate('/billing')}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bill Detail</h1>
          <p className="text-sm text-gray-400 font-mono">{bill.billNumber}</p>
        </div>
      </div>

      {/* Status card */}
      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${status.cls} print:hidden`}>
        <StatusIcon className="w-6 h-6" />
        <div>
          <p className="font-bold">{status.label}</p>
          <p className="text-sm opacity-75">{new Date(bill.createdAt).toLocaleString()}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {bill.paymentStatus === 'PENDING' && (
            <button
              onClick={handleMarkPaid}
              disabled={markingPaid}
              className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors font-medium disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" /> {markingPaid ? 'Updating...' : 'Mark as Paid'}
            </button>
          )}
          {bill.status === 'PAID' && (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors font-medium"
            >
              <XCircle className="w-4 h-4" /> Cancel Bill
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl border border-red-200 dark:border-red-800 print:hidden">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Meta info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-4 grid grid-cols-2 gap-4 text-sm transition-colors">
        <div>
          <p className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-0.5">Cashier</p>
          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
            <User className="w-3.5 h-3.5 text-gray-400" />
            {bill.user?.name || 'N/A'}
          </div>
        </div>
        <div>
          <p className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-0.5">Payment Mode</p>
          <div className="flex gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${MODE_CONFIG[bill.paymentMode]?.cls || ''}`}>
              <CreditCard className="w-3 h-3" />
              {MODE_CONFIG[bill.paymentMode]?.label || bill.paymentMode}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${bill.paymentStatus === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
              {bill.paymentStatus}
            </span>
          </div>
        </div>
        {bill.shippingStatus !== 'N/A' && (
          <>
            <div className="print:hidden space-y-2 col-span-2 border-t pt-2 mt-2 border-gray-100 dark:border-gray-700">
              <p className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-1">Add Tracking Update (Triggers WhatsApp)</p>
              <div className="flex gap-2">
                <select 
                  value={trackingForm.status} 
                  onChange={(e) => setTrackingForm({...trackingForm, status: e.target.value})} 
                  className="text-xs font-bold px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-1 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Location (e.g. Mumbai Hub)" 
                  value={trackingForm.location}
                  onChange={(e) => setTrackingForm({...trackingForm, location: e.target.value})}
                  className="text-xs px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-1 focus:ring-1 focus:ring-primary-500"
                />
                <input 
                  type="text" 
                  placeholder="Message (Optional)" 
                  value={trackingForm.message}
                  onChange={(e) => setTrackingForm({...trackingForm, message: e.target.value})}
                  className="text-xs px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-1 focus:ring-1 focus:ring-primary-500"
                />
                <button 
                  onClick={submitTrackingUpdate}
                  className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
            <div className="print:hidden">
              <p className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-0.5">Delivery Boy</p>
              <select value={bill.deliveryBoyId || ''} onChange={handleAssignDelivery} className="text-xs font-bold px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-primary-500">
                <option value="">Unassigned</option>
                {deliveryBoys.map(boy => (
                  <option key={boy.id} value={boy.id}>{boy.name}</option>
                ))}
              </select>
            </div>
          </>
        )}
        {bill.note && (
          <div className="col-span-2">
            <p className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-0.5">Note</p>
            <p className="text-gray-700 dark:text-gray-300">{bill.note}</p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Items ({bill.items.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {bill.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.product.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Package className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.product.name}</p>
                <p className="text-xs text-gray-400 font-mono">{item.product.sku}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-500 dark:text-gray-400">
                  ₹{parseFloat(item.unitPrice).toFixed(2)} × {item.quantity}
                </p>
                <p className="font-bold text-gray-900 dark:text-white">₹{parseFloat(item.subtotal).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-4 space-y-2 text-sm transition-colors">
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Subtotal</span>
          <span>₹{parseFloat(bill.totalAmount).toFixed(2)}</span>
        </div>
        {parseFloat(bill.discount) > 0 && (
          <div className="flex justify-between text-red-500 dark:text-red-400">
            <span>Discount</span>
            <span>−₹{parseFloat(bill.discount).toFixed(2)}</span>
          </div>
        )}
        {parseFloat(bill.tax) > 0 && (
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Tax</span>
            <span>+₹{parseFloat(bill.tax).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
          <span>Grand Total</span>
          <span className="text-primary-600 dark:text-primary-400">₹{parseFloat(bill.grandTotal).toFixed(2)}</span>
        </div>
      </div>

      {/* Confirm cancel modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Cancel Bill?</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              This will reverse all stock deductions for <strong className="text-gray-900 dark:text-white">{bill.billNumber}</strong> and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Keep Bill
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
