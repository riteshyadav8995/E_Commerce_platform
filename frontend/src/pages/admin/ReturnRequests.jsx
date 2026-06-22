import React, { useState, useEffect } from 'react';
import { PackageX, ExternalLink, User } from 'lucide-react';
import api from '../../services/api';

const ReturnRequests = () => {
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  const fetchReturnRequests = async () => {
    try {
      const response = await api.get('/billing/return-requests');
      setReturnRequests(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching return requests:', err);
      setError('Failed to fetch return requests. Please try again.');
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/billing/return-requests/${id}/status`, { status: newStatus });
      // Update local state
      setReturnRequests(prev => 
        prev.map(req => req.id === id ? { ...req, status: newStatus } : req)
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'APPROVED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REFUNDED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (error) {
    return <div className="text-red-600 text-center p-4 bg-red-50 rounded-lg">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Return Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and process customer returns and replacements.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer & Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason & Refund Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {returnRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <PackageX className="w-10 h-10 text-gray-300 mb-3" />
                      <p>No return requests found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                returnRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{req.billItem?.bill?.user?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">Bill: {req.billItem?.bill?.billNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={req.billItem?.product?.imageUrl || '/placeholder.png'} alt="" className="w-10 h-10 rounded object-cover border" />
                        <div className="text-sm text-gray-900 font-medium line-clamp-2 max-w-[200px]">
                          {req.billItem?.product?.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">{req.reason}</div>
                      <div className="text-xs text-gray-500 mt-1 uppercase font-semibold">Refund via: {req.refundMethod}</div>
                    </td>
                    <td className="px-6 py-4">
                      {req.imageUrl ? (
                        <a href={req.imageUrl} target="_blank" rel="noopener noreferrer" className="group relative block w-12 h-12 rounded border overflow-hidden">
                          <img src={req.imageUrl} alt="Defect" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="w-4 h-4 text-white" />
                          </div>
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No image</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        className={`text-sm rounded-full px-3 py-1 font-semibold border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${getStatusColor(req.status)}`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REFUNDED">REFUNDED</option>
                        <option value="REJECTED">REJECTED</option>
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

export default ReturnRequests;
