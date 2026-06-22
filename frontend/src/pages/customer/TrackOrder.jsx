import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';

const TrackOrder = () => {
  const { billNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (billNumber) {
      fetchOrderTracking();
    }
  }, [billNumber]);

  const fetchOrderTracking = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/billing/track/${billNumber}`);
      setOrder(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch order tracking details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Order Placed':
      case 'PENDING':
        return <Clock className="w-5 h-5 text-gray-500" />;
      case 'PACKED':
        return <Package className="w-5 h-5 text-indigo-500" />;
      case 'SHIPPED':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'OUT_FOR_DELIVERY':
        return <Truck className="w-5 h-5 text-orange-500" />;
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-200">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm text-center max-w-md w-full transition-colors duration-200">
          <div className="text-red-500 mb-4 flex justify-center"><Package className="w-12 h-12" /></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Order Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400">{error || 'Could not locate tracking details.'}</p>
        </div>
      </div>
    );
  }

  const events = order.trackingEvents || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors duration-200">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Track Order</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Order #{order.billNumber}</p>
            </div>
            <div className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-4 py-2 rounded-xl font-semibold text-sm inline-block">
              {order.shippingStatus.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tracking History</h2>
          
          {events.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No tracking events recorded yet.</p>
          ) : (
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-600 before:to-transparent">
              {events.map((event, index) => (
                <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-gray-800 bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-slate-300 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                    {getStatusIcon(event.status)}
                  </div>
                  
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl shadow-sm transition-colors duration-200">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white capitalize">{event.status.replace(/_/g, ' ')}</h3>
                      <time className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {new Date(event.createdAt).toLocaleDateString()} {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </div>
                    {event.message && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{event.message}</p>}
                    {event.location && (
                      <div className="flex items-center gap-1 mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Details Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-200">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Items in Order</h2>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b border-gray-50 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {item.product?.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">{item.product?.name || 'Unknown Product'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                </div>
                <div className="font-bold text-gray-900 dark:text-white">
                  ₹{Number(item.subtotal).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
