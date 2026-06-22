import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Truck } from 'lucide-react';
import confetti from 'canvas-confetti';

const OrderSuccess = () => {
  const { billNumber } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger confetti animation on load
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#4f46e5', '#10b981', '#f59e0b']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4f46e5', '#10b981', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-6">
          Thank you for shopping with us. Your order has been successfully placed.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-8">
          <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Order Number</p>
          <p className="text-xl font-bold text-gray-900">{billNumber}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(`/track-order/${billNumber}`)}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3.5 px-4 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
          >
            <Truck className="w-5 h-5" /> Track Your Order
          </button>
          
          <button
            onClick={() => navigate('/store')}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-200 py-3.5 px-4 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" /> Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
