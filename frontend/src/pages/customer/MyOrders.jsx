import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Package, Truck, CheckCircle, Clock, MapPin, ChevronRight, XCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const MyOrders = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await api.get('/billing/my-orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'PACKED': return <Package className="w-5 h-5 text-blue-500" />;
      case 'SHIPPED': return <Truck className="w-5 h-5 text-indigo-500" />;
      case 'OUT_FOR_DELIVERY': return <MapPin className="w-5 h-5 text-purple-500" />;
      case 'DELIVERED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'CANCELLED': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50';
      case 'PACKED': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50';
      case 'OUT_FOR_DELIVERY': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50';
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Your Orders</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">View your purchase history and track ongoing deliveries.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors duration-200">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Looks like you haven't placed any orders with us.</p>
          <button 
            onClick={() => navigate('/store')}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
              {/* Order Header */}
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
                  <div>
                    <span className="block text-gray-500 dark:text-gray-400 mb-1">Order Placed</span>
                    <span className="font-medium text-gray-900 dark:text-white">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 dark:text-gray-400 mb-1">Total Amount</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{order.grandTotal}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 dark:text-gray-400 mb-1">Order Number</span>
                    <Link to={`/order-details/${order.billNumber}`} className="font-medium text-[#007185] dark:text-[#4da3ff] hover:text-[#c45500] hover:underline">
                      {order.billNumber}
                    </Link>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(order.shippingStatus)}`}>
                    {getStatusIcon(order.shippingStatus)}
                    {order.shippingStatus.replace(/_/g, ' ')}
                  </span>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={() => navigate(`/order-details/${order.billNumber}`)}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      View order details
                    </button>
                    {order.shippingStatus !== 'CANCELLED' && order.shippingStatus !== 'DELIVERED' && (
                      <button
                        onClick={() => navigate(`/track-order/${order.billNumber}`)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Track Order
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="flex flex-col gap-6">
                  {order.items.map((item) => {
                    const returnReq = item.returnRequests?.[0];
                    return (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 border border-gray-100 dark:border-gray-600">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">{item.product.name}</h4>
                        <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>Qty: {item.quantity}</span>
                          <span>₹{item.unitPrice} each</span>
                        </div>
                        {returnReq && (
                          <div className="mt-2 text-sm font-medium text-[#c45500] dark:text-amber-500">
                            Return Requested ({returnReq.status})
                          </div>
                        )}
                      </div>
                      <div className="text-right font-medium text-gray-900 dark:text-white">
                        ₹{item.subtotal}
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
