import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const PrintableOrderSummary = () => {
  const { billNumber } = useParams();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="text-gray-500">Loading order summary...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="text-red-500">Order not found.</div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-gray-100 min-h-screen py-10 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-10 shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-normal text-gray-900 mb-2">Order Summary</h1>
            <div className="text-sm text-gray-700 flex items-center gap-4">
              <span>Order placed {orderDate}</span>
              <span className="text-gray-300">|</span>
              <span>Order number {order.billNumber}</span>
            </div>
          </div>
          <button 
            onClick={() => window.print()}
            className="print:hidden bg-[#ffd814] hover:bg-[#F7CA00] text-black px-6 py-1.5 rounded-full text-sm font-medium border border-[#FCD200] shadow-[0_2px_5px_rgba(213,217,217,0.5)] transition-colors"
          >
            Print
          </button>
        </div>

        {/* Info Box */}
        <div className="border border-gray-300 rounded-md overflow-hidden mb-6 flex flex-col md:flex-row text-sm">
          {/* Ship To */}
          <div className="p-4 md:w-1/3 md:border-r border-gray-300">
            <h3 className="font-bold text-gray-900 mb-2">Ship to</h3>
            <div className="text-gray-900 leading-tight space-y-0.5">
              <div className="font-medium">{order.user?.name || 'Customer'}</div>
              {order.user?.address ? (
                <div className="whitespace-pre-line">{order.user.address}</div>
              ) : (
                <div className="text-gray-500 italic">Address not provided</div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-4 md:w-1/3 md:border-r border-gray-300">
            <h3 className="font-bold text-gray-900 mb-2">Payment method</h3>
            <div className="text-gray-900">
              {order.paymentMode === 'CASH' ? 'Pay on Delivery' : 'Online Payment'}
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-4 md:w-1/3">
            <h3 className="font-bold text-gray-900 mb-2">Order Summary</h3>
            <div className="text-gray-900 space-y-1">
              <div className="flex justify-between">
                <span>Item(s) Subtotal:</span>
                <span>₹{parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span>₹{parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Promotion Applied:</span>
                <span>-₹{parseFloat(order.discount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold mt-1 pt-1 border-t border-gray-200">
                <span>Grand Total:</span>
                <span>₹{parseFloat(order.grandTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Box */}
        <div className="border border-gray-300 rounded-md p-6">
          {order.items.map((item, index) => (
            <div key={item.id} className={`flex gap-6 ${index > 0 ? 'mt-6 pt-6 border-t border-gray-200' : ''}`}>
              <div className="w-24 h-24 shrink-0 p-1 border border-gray-200">
                {item.product.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Image</div>
                )}
              </div>
              <div>
                <div className="text-[#007185] font-medium text-base mb-1">{item.product.name}</div>
                <div className="text-xs text-gray-600 mb-2">Sold by: LuxeStore India</div>
                <div className="text-[#B12704] font-bold text-sm">₹{parseFloat(item.unitPrice).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrintableOrderSummary;
