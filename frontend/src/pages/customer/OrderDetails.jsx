import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import { ChevronRight, Download, Package, AlertCircle, CheckCircle } from 'lucide-react';
import ReturnItemModal from '../../components/customer/ReturnItemModal';

const OrderDetails = () => {
  const { billNumber } = useParams();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Return Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedItemForReturn, setSelectedItemForReturn] = useState(null);
  const [returnSuccessMsg, setReturnSuccessMsg] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await api.get(`/billing/track/${billNumber}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [billNumber, isAuthenticated, navigate]);

  const handleDownloadInvoice = async () => {
    try {
      setDownloading(true);
      const response = await api.get(`/billing/invoice/${billNumber}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${billNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setDownloading(false);
      setIsInvoiceOpen(false);
    }
  };

  const handleDownloadPackingSlip = async () => {
    try {
      setDownloading(true);
      const response = await api.get(`/billing/packing-slip/${billNumber}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `packing-slip-${billNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download packing slip:', error);
      alert('Failed to download packing slip. Please try again.');
    } finally {
      setDownloading(false);
      setIsInvoiceOpen(false);
    }
  };

  const handleReturnSuccess = () => {
    setReturnModalOpen(false);
    setSelectedItemForReturn(null);
    setReturnSuccessMsg('Return request submitted successfully. We will review it shortly.');
    setTimeout(() => setReturnSuccessMsg(''), 5000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
        <p className="text-gray-500 mt-2">The order you are looking for does not exist.</p>
        <button onClick={() => navigate('/orders')} className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg">Back to Orders</button>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 font-sans animate-fade-in transition-colors duration-200">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link to="/orders" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">Your Account</Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <Link to="/orders" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">Your Orders</Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="text-[#c45500] dark:text-amber-500">Order Details</span>
      </div>

      <h1 className="text-3xl font-normal text-gray-900 dark:text-white mb-4">Order Details</h1>

      {returnSuccessMsg && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 px-4 py-3 rounded-md flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{returnSuccessMsg}</span>
        </div>
      )}

      {/* Order Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <span>Order placed <span className="text-gray-900 dark:text-white font-medium">{orderDate}</span></span>
          <span className="hidden sm:inline text-gray-300 dark:text-gray-600">|</span>
          <span>Order number <span className="text-gray-900 dark:text-white font-medium">{order.billNumber}</span></span>
        </div>

        {/* Invoice Dropdown */}
        <div className="relative mt-2 sm:mt-0">
          <button
            onClick={() => setIsInvoiceOpen(!isInvoiceOpen)}
            className="text-[#007185] dark:text-[#4da3ff] hover:text-[#c45500] dark:hover:text-amber-500 hover:underline flex items-center font-medium"
          >
            Invoice
          </button>

          {isInvoiceOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg rounded-sm py-1 z-10 text-sm">
              <button
                onClick={() => {
                  window.open(`/print-order-summary/${billNumber}`, '_blank');
                  setIsInvoiceOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white text-[#007185] dark:text-[#4da3ff]"
              >
                Printable Order Summary
              </button>
              <button
                onClick={handleDownloadInvoice}
                disabled={downloading}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white text-[#007185] dark:text-[#4da3ff] disabled:opacity-50"
              >
                {downloading ? 'Downloading...' : 'Invoice'}
              </button>
              <button
                onClick={handleDownloadPackingSlip}
                disabled={downloading}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white text-[#007185] dark:text-[#4da3ff] disabled:opacity-50"
              >
                Warranty / Pslip
              </button>
              <button
                onClick={() => setIsInvoiceOpen(false)}
                className="absolute -top-3 -right-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 shadow-sm"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Box */}
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden mb-6 flex flex-col md:flex-row transition-colors">
        {/* Ship To */}
        <div className="p-4 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Ship to</h3>
          <div className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed">
            <div className="font-medium">{order.user?.name || 'Customer'}</div>
            {order.user?.address ? (
              <div className="whitespace-pre-line">{order.user.address}</div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 italic">Address not provided</div>
            )}
            {order.user?.phone && <div>Phone: {order.user.phone}</div>}
          </div>
        </div>

        {/* Payment Method */}
        <div className="p-4 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Payment method</h3>
          <div className="text-sm text-gray-800 dark:text-gray-300">
            {order.paymentMode === 'CASH' ? 'Pay on Delivery' : 'Online Payment'}
          </div>
        </div>

        {/* Order Summary */}
        <div className="p-4 md:w-1/3 bg-white dark:bg-gray-800 transition-colors">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Order Summary</h3>
          <div className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
            <div className="flex justify-between">
              <span>Item(s) Subtotal:</span>
              <span>₹{parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>₹0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>₹{parseFloat(order.tax || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Promotion Applied:</span>
              <span>-₹{parseFloat(order.discount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 dark:text-white mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>Grand Total:</span>
              <span>₹{parseFloat(order.grandTotal).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 transition-colors">
        <div className="bg-gray-100 dark:bg-gray-900/50 p-4 border-b border-gray-300 dark:border-gray-700 transition-colors">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
            {order.shippingStatus === 'DELIVERED' ? `Delivered on ${new Date(order.trackingEvents[0]?.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}` : `Status: ${order.shippingStatus.replace(/_/g, ' ')}`}
          </h3>
          {order.shippingStatus !== 'DELIVERED' && order.shippingStatus !== 'CANCELLED' && (
            <button
              onClick={() => navigate(`/track-order/${order.billNumber}`)}
              className="mt-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-1.5 rounded-full font-medium transition-colors border border-yellow-500 shadow-sm"
            >
              Track Package
            </button>
          )}
        </div>

        <div className="p-4 flex flex-col gap-6">
          {order.items.map((item) => {
            const returnReq = item.returnRequests?.[0];
            return (
              <div key={item.id} className="flex gap-4">
                <div className="w-24 h-24 shrink-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-1">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Link to={`/product/${item.product.id}`} className="text-[#007185] dark:text-[#4da3ff] hover:text-[#c45500] dark:hover:text-amber-500 hover:underline font-medium text-base line-clamp-2">
                    {item.product.name}
                  </Link>
                  <div className="text-[#B12704] dark:text-amber-500 font-bold mt-1">₹{parseFloat(item.unitPrice).toFixed(2)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quantity: {item.quantity}</div>

                  <div className="mt-3 flex gap-2 items-center flex-wrap">
                    <button
                      onClick={() => navigate(`/product/${item.product.id}`)}
                      className="text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded shadow-sm transition-colors"
                    >
                      Buy it again
                    </button>
                    {order.shippingStatus === 'DELIVERED' && !returnReq && (
                      <button
                        onClick={() => {
                          setSelectedItemForReturn(item);
                          setReturnModalOpen(true);
                        }}
                        className="text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded shadow-sm transition-colors"
                      >
                        Return or replace items
                      </button>
                    )}
                    {returnReq && (
                      <span className="text-sm font-medium text-[#c45500] dark:text-amber-400 bg-orange-50 dark:bg-amber-900/30 px-3 py-1.5 rounded border border-orange-200 dark:border-amber-800">
                        Return Requested ({returnReq.status})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <ReturnItemModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        billItem={selectedItemForReturn}
        onSuccess={handleReturnSuccess}
      />
    </div>
  );
};

export default OrderDetails;
