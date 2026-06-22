import React, { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const ReturnItemModal = ({ isOpen, onClose, billItem, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('UPI');
  const [refundDetails, setRefundDetails] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !billItem) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!reason || !refundDetails || !image) {
      setError('Please fill in all required fields and upload an image.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('billItemId', billItem.id);
      formData.append('reason', reason);
      formData.append('refundMethod', refundMethod);
      formData.append('refundDetails', refundDetails);
      formData.append('image', image);

      await api.post('/billing/return-request', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onSuccess();
    } catch (err) {
      console.error('Submit return error:', err);
      setError(err.response?.data?.message || 'Failed to submit return request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="relative z-10 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Return or Replace Item
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <img 
                src={billItem.product.imageUrl || 'https://via.placeholder.com/150'} 
                alt={billItem.product.name} 
                className="w-16 h-16 object-contain bg-white border border-gray-200 p-1"
              />
              <div>
                <h4 className="font-medium text-gray-900 line-clamp-2">{billItem.product.name}</h4>
                <p className="text-sm text-gray-500">Qty: {billItem.quantity}</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for return <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows="3"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm p-2 border"
                  placeholder="Please describe the issue with the item..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Product Image <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">Show the defect or wrong item clearly.</p>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md shadow-sm text-sm font-medium flex items-center gap-2 transition-colors">
                    <Upload className="w-4 h-4" />
                    Choose Image
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="h-12 w-12 object-cover rounded border border-gray-200" />
                  )}
                </div>
              </div>

              {/* Refund Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Refund Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm p-2 border bg-white"
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              {/* Refund Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {refundMethod === 'UPI' ? 'UPI ID' : 'Bank Account Details'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm p-2 border"
                  placeholder={refundMethod === 'UPI' ? 'e.g. 9876543210@upi' : 'Account Number & IFSC Code'}
                  value={refundDetails}
                  onChange={(e) => setRefundDetails(e.target.value)}
                />
              </div>

            </form>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#ffd814] hover:bg-[#F7CA00] text-black font-medium focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 font-medium focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnItemModal;
