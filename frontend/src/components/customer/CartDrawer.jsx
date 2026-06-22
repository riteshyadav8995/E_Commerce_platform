import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import { ShoppingCart, Plus, Minus, CreditCard, ShoppingBag, CheckCircle } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { cart, updateQuantity, getCartTotal, clearCart } = useCartStore();
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const cartTotal = getCartTotal();

  const handleCheckout = async (paymentMode) => {
    if (cart.length === 0) return;
    if (!isAuthenticated) {
      onClose();
      navigate('/login?checkout=true');
      return;
    }
    setCheckoutLoading(true);
    try {
      const items = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: parseFloat(item.product.price),
      }));

      const response = await api.post('/billing', {
        items,
        discount: 0,
        paymentMode: paymentMode,
        note: `Web Customer Order - ${paymentMode}`,
        callbackUrl: window.location.origin + window.location.pathname,
      });

      clearCart();
      onClose();
      
      if (paymentMode === 'LINK' && response.data.razorpayOrderId) {
        const options = {
          key: response.data.razorpayKeyId,
          order_id: response.data.razorpayOrderId,
          name: "LuxeStore",
          description: `Payment for Order ${response.data.billNumber}`,
          handler: function (rzpResponse) {
            // Verify payment on success
            api.post('/billing/verify-payment', { 
              payment_link_id: response.data.razorpayOrderId, 
              payment_id: rzpResponse.razorpay_payment_id 
            }).then(() => {
              navigate(`/order-success/${response.data.billNumber}`);
            }).catch(err => console.error(err));
          },
          prefill: {
            name: user?.name || "Customer",
            email: user?.email || "customer@luxestore.com",
            contact: user?.phone || "9999999999"
          },
          theme: {
            color: "#4f46e5"
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (res){
          alert("Payment failed: " + res.error.description);
        });
        rzp.open();
        return;
      }

      // For COD
      navigate(`/order-success/${response.data.billNumber}`);

    } catch (error) {
      console.error('Checkout failed', error);
      alert(error.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isOpen && !orderPlaced) return null;

  return (
    <>
      {/* Notifications overlay (detached from drawer) */}
      {orderPlaced && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-xl font-medium shadow-2xl flex items-center gap-3 animate-slide-down z-[60]">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <p>Order placed successfully! Your items will be shipped soon.</p>
        </div>
      )}

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 h-full flex flex-col shadow-2xl animate-slide-left transition-colors duration-200">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900 transition-colors">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary-600" />
                Your Cart
              </h2>
              <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none transition-colors">
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex gap-4 items-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-lg shadow-sm transition-colors">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-md flex items-center justify-center border border-gray-100 dark:border-gray-600 flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">{item.product.name}</h4>
                      <p className="text-primary-600 dark:text-primary-400 font-semibold text-sm">₹{item.product.price}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                      <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400 shadow-sm transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-medium text-sm w-4 text-center dark:text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400 shadow-sm transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Subtotal</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="space-y-3">
                  {!showPaymentOptions ? (
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          onClose();
                          navigate('/login?checkout=true');
                        } else {
                          setShowPaymentOptions(true);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      <CreditCard className="w-5 h-5" /> Order Now
                    </button>
                  ) : (
                    <div className="space-y-3 animate-fade-in">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 text-center">Select Payment Method</p>
                      <button
                        onClick={() => handleCheckout('LINK')}
                        disabled={checkoutLoading}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
                      >
                        {checkoutLoading ? 'Processing...' : (
                          <React.Fragment>
                            <CreditCard className="w-5 h-5" /> Pay Online (Debit/Credit/UPI)
                          </React.Fragment>
                        )}
                      </button>
                      <button
                        onClick={() => handleCheckout('CASH')}
                        disabled={checkoutLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm disabled:opacity-70"
                      >
                        {checkoutLoading ? 'Processing...' : 'Cash on Delivery (COD)'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CartDrawer;
