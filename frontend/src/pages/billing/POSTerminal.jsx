import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ShoppingCart, Plus, Minus, Trash2, Receipt,
  CreditCard, Banknote, Smartphone, X, CheckCircle, AlertCircle,
  Package, Tag, ChevronRight, QrCode, ArrowRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import * as productService from '../../services/productService';
import * as billingService from '../../services/billingService';

const PAYMENT_MODES = [
  { value: 'CASH', label: 'Cash',   icon: Banknote },
  { value: 'CARD', label: 'Card',   icon: CreditCard },
  { value: 'UPI',  label: 'UPI',    icon: Smartphone },
];

// ── Receipt Modal ────────────────────────────────────────────────────────────
function ReceiptModal({ bill, onClose, onNewBill }) {
  const printReceipt = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-emerald-600 dark:bg-emerald-700 p-6 text-center text-white shrink-0 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-emerald-200 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <CheckCircle className="w-14 h-14 mx-auto mb-3 opacity-90" />
          <h2 className="text-2xl font-bold">Payment Successful!</h2>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900/50 receipt-print">
          {/* Company Info */}
          <div className="text-center mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">LUXESTORE POS</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">123 Commerce St, Tech City</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">GST: 27AABCU9603R1ZN</p>
          </div>

          {/* Meta Info */}
          <div className="border-t border-b border-gray-200 dark:border-gray-700 py-3 mb-4 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Bill No:</span>
              <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{bill.billNumber}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Date:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(bill.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Payment:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{bill.paymentMode}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Cashier:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{bill.user?.name || 'Admin'}</span>
            </div>
          </div>

          {/* Items */}
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 text-gray-600 dark:text-gray-400 font-semibold">Item</th>
                <th className="text-center py-2 text-gray-600 dark:text-gray-400 font-semibold">Qty</th>
                <th className="text-right py-2 text-gray-600 dark:text-gray-400 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {bill.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5">
                    <p className="font-medium text-gray-900 dark:text-gray-200">{item.product?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@ ₹{parseFloat(item.unitPrice).toFixed(2)}</p>
                  </td>
                  <td className="py-2.5 text-center text-gray-800 dark:text-gray-300 font-medium">{item.quantity}</td>
                  <td className="py-2.5 text-right font-bold text-gray-900 dark:text-white">₹{parseFloat(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="space-y-1 text-sm border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              <span>₹{parseFloat(bill.totalAmount).toFixed(2)}</span>
            </div>
            {parseFloat(bill.discount) > 0 && (
              <div className="flex justify-between text-red-500">
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
            <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
              <span>Grand Total</span>
              <span>₹{parseFloat(bill.grandTotal).toFixed(2)}</span>
            </div>
          </div>

          {/* Footer message */}
          <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Thank you for shopping with us!</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Visit again</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-3 shrink-0">
          <button
            onClick={onNewBill}
            className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
          >
            New Bill
          </button>
          <button
            onClick={printReceipt}
            className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

// ── UPI Payment Modal ────────────────────────────────────────────────────────
function UPIModal({ bill, onConfirmPayment, onCancel }) {
  const [confirming, setConfirming] = useState(false);
  const upiUrl = `upi://pay?pa=luxestore@upi&pn=LuxeStore&am=${parseFloat(bill.grandTotal).toFixed(2)}&cu=INR&tr=${bill.billNumber}`;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await billingService.markPaid(bill.id);
      onConfirmPayment();
    } catch (err) {
      alert('Failed to confirm payment');
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col items-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">UPI Payment</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">Scan the QR code below using any UPI app (GPay, PhonePe, Paytm, etc.) to pay for the order.</p>
        
        <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100 mb-6 flex flex-col items-center">
          <QRCodeSVG value={upiUrl} size={200} level="H" />
        </div>
        
        <div className="text-center mb-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Amount to Pay</p>
          <p className="text-3xl font-bold text-primary-600">₹{parseFloat(bill.grandTotal).toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">Order: {bill.billNumber}</p>
        </div>

        <div className="w-full flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-[2] py-3 flex justify-center items-center gap-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {confirming ? 'Confirming...' : 'Confirm Payment'}
            {!confirming && <CheckCircle className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main POS Component ───────────────────────────────────────────────────────
export default function POSTerminal() {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [products, setProducts]       = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart]               = useState([]);
  const [discount, setDiscount]       = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [note, setNote]               = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [successBill, setSuccessBill] = useState(null);

  // Load products on mount
  useEffect(() => {
    productService.getProducts({ limit: 200, status: 'active' })
      .then((r) => setProducts(r.data.products || r.data))
      .catch(console.error);
  }, []);

  // Filter products by search
  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q)) ||
      (p.category?.name || '').toLowerCase().includes(q)
    );
  });

  // ── Cart helpers ──────────────────────────────────────────────────────────
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: parseFloat(product.price),
          tax: parseFloat(product.tax),
          imageUrl: product.imageUrl,
          quantity: 1,
          stock: product.inventories?.reduce((s, inv) => s + inv.quantity, 0) ?? 999,
        },
      ];
    });
    setSearchQuery('');
    searchRef.current?.focus();
  };

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) =>
    setCart((prev) => prev.filter((item) => item.productId !== productId));

  const clearCart = () => {
    setCart([]);
    setDiscount('');
    setNote('');
    setError('');
  };

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((s, item) => s + item.price * item.quantity, 0);
  const taxAmount = cart.reduce(
    (s, item) => s + item.price * item.quantity * (item.tax / 100), 0
  );
  const discountAmt = parseFloat(discount) || 0;
  const grandTotal = subtotal - discountAmt + taxAmount;

  // ── Submit Bill ───────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (!cart.length) return setError('Cart is empty');
    setError('');
    setLoading(true);
    try {
        const payload = {
          items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          discount: discountAmt,
          paymentMode,
          note,
          isPOS: true,
        };
        const res = await billingService.createBill(payload);
      setSuccessBill(res.data);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-0 -m-6 overflow-hidden bg-gray-50 dark:bg-gray-900">

      {/* ── LEFT: Product Search ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-5 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">POS Terminal</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">Select products to add to cart</p>
          </div>
          <button
            onClick={() => navigate('/billing')}
            className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            <Receipt className="w-4 h-4" /> Bill History
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by name, SKU or barcode…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Package className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((product) => {
                const stock = product.inventories?.reduce((s, inv) => s + inv.quantity, 0) ?? 0;
                const inCart = cart.find((i) => i.productId === product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={stock === 0}
                    className={`relative text-left rounded-xl border transition-all hover:shadow-md active:scale-95 overflow-hidden group
                      ${stock === 0 ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800' :
                        inCart ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                  >
                    {/* Image */}
                    <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight">{product.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{product.category?.name}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-sm font-bold text-primary-600">₹{parseFloat(product.price).toFixed(2)}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {stock}
                        </span>
                      </div>
                    </div>
                    {/* In-cart badge */}
                    {inCart && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">
                        {inCart.quantity}
                      </div>
                    )}
                    {/* Out of stock overlay */}
                    {stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                        <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">Out of Stock</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Cart & Checkout ───────────────────────────────────────── */}
      <div className="w-80 lg:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Cart header */}
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary-600" />
            <span className="font-bold text-gray-900 dark:text-white">Cart</span>
            {cart.length > 0 && (
              <span className="text-xs bg-primary-100 text-primary-700 font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <ShoppingCart className="w-12 h-12 mb-3" />
              <p className="text-sm text-gray-400">Cart is empty</p>
              <p className="text-xs text-gray-300 mt-1">Select products on the left</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Package className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">₹{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQty(item.productId, -1)}
                    className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center text-sm font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.productId, 1)}
                    disabled={item.quantity >= item.stock}
                    className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400 flex items-center justify-center hover:bg-primary-200 dark:hover:bg-primary-800/50 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="ml-1 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary & Checkout */}
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-4 space-y-3">
          {/* Discount */}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="number"
              placeholder="Discount amount (₹)"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              min="0"
              max={subtotal}
              className="flex-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          {/* Payment mode */}
          <div className="flex gap-2">
            {PAYMENT_MODES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setPaymentMode(value)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-semibold border transition-all
                  ${paymentMode === value
                    ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-500'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Note */}
          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
          />

          {/* Totals */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl px-3 py-3 space-y-1.5 text-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {discountAmt > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Discount</span>
                <span>−₹{discountAmt.toFixed(2)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Tax</span>
                <span>+₹{taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
              <span>Total</span>
              <span className="text-primary-600 dark:text-primary-400">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Checkout button */}
          <button
            onClick={handleCheckout}
            disabled={loading || !cart.length}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold text-sm
              hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed
              transition-all shadow-lg shadow-primary-200 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Processing…
              </span>
            ) : (
              <>
                <Receipt className="w-4 h-4" />
                Charge ₹{grandTotal.toFixed(2)}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Receipt / QR Modal */}
      {successBill && successBill.paymentMode === 'UPI' && successBill.paymentStatus === 'PENDING' ? (
        <UPIModal 
          bill={successBill}
          onConfirmPayment={() => {
            setSuccessBill({ ...successBill, paymentStatus: 'PAID' });
          }}
          onCancel={() => {
            setSuccessBill(null);
            searchRef.current?.focus();
          }}
        />
      ) : successBill ? (
        <ReceiptModal
          bill={successBill}
          onClose={() => setSuccessBill(null)}
          onNewBill={() => {
            setSuccessBill(null);
            searchRef.current?.focus();
          }}
        />
      ) : null}
    </div>
  );
}
