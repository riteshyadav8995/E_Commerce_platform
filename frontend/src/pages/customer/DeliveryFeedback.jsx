import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Star, MessageSquare, CheckCircle } from 'lucide-react';

const DeliveryFeedback = () => {
  const { billNumber } = useParams();
  const navigate = useNavigate();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await api.post('/feedback', {
        billNumber,
        rating,
        message
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-500 mb-6">Your feedback helps us improve our delivery service.</p>
          <button 
            onClick={() => navigate('/store')}
            className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-2">Rate Your Delivery</h1>
        <p className="text-gray-500 text-center mb-8">How was the delivery for order #{billNumber}?</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  className={`w-12 h-12 ${
                    (hoverRating || rating) >= star 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm font-medium text-gray-500">
            {rating === 0 && 'Select a rating'}
            {rating === 1 && 'Terrible'}
            {rating === 2 && 'Bad'}
            {rating === 3 && 'Okay'}
            {rating === 4 && 'Good'}
            {rating === 5 && 'Excellent!'}
          </p>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Comments
            </label>
            <div className="relative">
              <MessageSquare className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you liked or what we can improve..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all outline-none resize-none h-32"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeliveryFeedback;
