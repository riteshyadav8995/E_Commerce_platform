import React, { useState, useEffect } from 'react';
import { Package, MapPin, Phone, CheckCircle, Clock } from 'lucide-react';
import * as billingService from '../../services/billingService';

export default function DeliveryDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await billingService.getDeliveryTasks();
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await billingService.updateShippingStatus(id, status);
      fetchTasks(); // refresh
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.shippingStatus !== 'DELIVERED');
  const completedTasks = tasks.filter(t => t.shippingStatus === 'DELIVERED');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
        <p className="text-gray-500">You have {pendingTasks.length} pending deliveries today.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" /> Pending Deliveries
        </h2>
        {pendingTasks.length === 0 ? (
          <p className="text-gray-500 bg-white p-6 rounded-2xl border border-gray-100 text-center">No pending tasks. Great job!</p>
        ) : (
          pendingTasks.map(task => (
            <div key={task.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{task.billNumber}</h3>
                  <p className="text-sm text-gray-500">{new Date(task.createdAt).toLocaleString()}</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                  {task.shippingStatus}
                </span>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Delivery Address</p>
                    <p className="text-gray-600">Please check WhatsApp or order note for the address.</p>
                  </div>
                </div>
                {task.customer?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${task.customer.phone}`} className="font-medium text-indigo-600 hover:underline">
                      {task.customer.phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                {task.shippingStatus !== 'OUT_FOR_DELIVERY' && (
                  <button 
                    onClick={() => updateStatus(task.id, 'OUT_FOR_DELIVERY')}
                    className="flex-1 py-2.5 bg-orange-50 text-orange-700 font-semibold rounded-xl hover:bg-orange-100 transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <Truck className="w-4 h-4" /> Out for Delivery
                  </button>
                )}
                <button 
                  onClick={() => updateStatus(task.id, 'DELIVERED')}
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4" /> Delivered
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" /> Completed
          </h2>
          {completedTasks.map(task => (
            <div key={task.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-col gap-2 opacity-80">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-700">{task.billNumber}</h3>
                  <p className="text-xs text-gray-500">Delivered</p>
                </div>
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              {task.feedback && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(task.feedback.rating)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    ))}
                  </div>
                  {task.feedback.message && (
                    <p className="text-xs text-gray-600 mt-1 italic">"{task.feedback.message}"</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
