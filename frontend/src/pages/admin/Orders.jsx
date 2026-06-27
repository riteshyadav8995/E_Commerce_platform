import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Download, RefreshCw, FileText } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Orders = () => {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Using the same endpoint but it might fetch pos orders too.
      // We can just fetch all bills as they are all "orders".
      const res = await api.get('/billing', {
        params: { limit: 100 }
      });
      setOrders(res.data.bills);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(
        `/billing/${id}/shipping`,
        { status: newStatus }
      );
      toast.success('Status updated & WhatsApp message sent!');
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await api.get('/billing/export/csv', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'orders_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-600" />
            Orders Management
          </h1>
          <p className="text-gray-500 mt-1 text-sm">View newly placed orders, change statuses, and notify customers.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm shadow-green-200"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4">Order ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Products</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Shipping Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-primary-600">
                      {order.billNumber}
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{order.user?.name || order.customer?.name || 'Guest'}</div>
                    </td>
                    <td className="p-4 text-gray-600 max-w-xs truncate">
                      {order.items?.map(i => i.product.name).join(', ')}
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      ₹{parseFloat(order.grandTotal).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.shippingStatus || 'PENDING'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-sm rounded-lg border-gray-200 focus:ring-primary-500 focus:border-primary-500 py-1.5 pl-3 pr-8 ${
                          order.shippingStatus === 'DELIVERED' ? 'bg-green-50 text-green-700 font-medium' :
                          order.shippingStatus === 'SHIPPED' ? 'bg-blue-50 text-blue-700 font-medium' :
                          order.shippingStatus === 'OUT_FOR_DELIVERY' ? 'bg-indigo-50 text-indigo-700 font-medium' :
                          order.shippingStatus === 'PACKED' ? 'bg-amber-50 text-amber-700 font-medium' :
                          'bg-gray-50 text-gray-700'
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PACKED">PACKED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
