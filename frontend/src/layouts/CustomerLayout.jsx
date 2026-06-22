import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { ShoppingBag, LogOut, User, Mail, Phone, MapPin, ShoppingCart, Settings, Moon, Sun } from 'lucide-react';
import InquiryModal from '../components/customer/InquiryModal';
import ProfileModal from '../components/customer/ProfileModal';
import LocationModal from '../components/customer/LocationModal';
import CartDrawer from '../components/customer/CartDrawer';
import ChatbotWidget from '../components/customer/ChatbotWidget';

const CustomerLayout = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const cartCount = useCartStore((state) => state.getCartCount());
  const navigate = useNavigate();
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const dropdownRef = useRef(null);

  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Check if returned from Razorpay
    const params = new URLSearchParams(window.location.search);
    const mockPayment = params.get('mock_payment') === 'success';
    const plinkId = params.get('razorpay_payment_link_id');
    const pid = params.get('razorpay_payment_id');

    if (mockPayment || plinkId) {
      setPaymentSuccess(true);
      
      // Tell backend to verify/sync the payment since webhooks might not reach localhost
      if (plinkId) {
        import('../services/api').then(({ default: api }) => {
          api.post('/billing/verify-payment', { payment_link_id: plinkId, payment_id: pid }).catch(() => {});
        });
      }

      setTimeout(() => {
        setPaymentSuccess(false);
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 5000);
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener('open-cart', handleOpenCart);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('open-cart', handleOpenCart);
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you really want to log out?')) {
      logout();
      navigate('/store');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      {paymentSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-xl font-medium shadow-2xl flex items-center gap-3 animate-slide-down z-[60]">
          <span className="w-6 h-6 flex items-center justify-center bg-green-500 rounded-full">✓</span>
          <p>Payment Successful! Your order is confirmed.</p>
        </div>
      )}      {/* Top Navigation */}
      <header className="bg-[#2874f0] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            
            {/* Logo & Location */}
            <div className="flex items-center gap-6 shrink-0">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/store')}>
                <ShoppingBag className="w-6 h-6 text-yellow-400" />
                <span className="font-bold text-xl tracking-tight italic">LuxeStore</span>
              </div>
              
              <button 
                onClick={() => {
                  if (isAuthenticated) navigate('/address/new');
                  else navigate('/login');
                }}
                className="hidden lg:flex items-center gap-1.5 hover:border hover:border-white p-2 rounded-sm border border-transparent transition-all"
              >
                <MapPin className="w-4 h-4 mt-1" />
                <div className="flex flex-col text-left">
                  <span className="text-[11px] text-gray-200 leading-none">Deliver to</span>
                  <span className="text-[13px] font-bold leading-none mt-0.5">
                    {user?.address ? user.address.substring(0, 15) + '...' : 'Select Location'}
                  </span>
                </div>
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-3xl hidden md:flex">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = e.target.search.value;
                  if (val) navigate(`/store?search=${encodeURIComponent(val)}`);
                  else navigate('/store');
                }}
                className="w-full flex"
              >
                <input 
                  type="text" 
                  name="search"
                  placeholder="Search for products, brands and more" 
                  className="w-full px-4 py-2 text-gray-900 rounded-l-sm outline-none placeholder-gray-500"
                />
                <button type="submit" className="bg-white px-4 text-[#2874f0] rounded-r-sm hover:bg-gray-100 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </form>
            </div>

            {/* Right Side Items (Login + Cart) */}
            <div className="flex items-center gap-6 ml-auto shrink-0">
              
              {isAuthenticated ? (
                <div className="relative group" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1.5 font-medium hover:text-gray-200 transition-colors"
                  >
                    <span className="truncate max-w-[100px]">{user?.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-xl py-1 z-50 text-gray-800">
                      <div className="px-4 py-2 border-b border-gray-100 font-semibold text-sm">
                        Hello, {user?.name}
                      </div>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4 text-gray-500" /> Update Profile
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('/orders');
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4 text-gray-500" /> Orders
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-white text-[#2874f0] font-bold px-8 py-1.5 rounded-sm hover:bg-gray-100 transition-colors"
                >
                  Login
                </Link>
              )}

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Cart Icon */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-cart'))}
                className="flex items-center gap-2 font-medium hover:text-gray-200 transition-colors relative"
              >
                <div className="relative">
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#2874f0]">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span>Cart</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Nav */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm hidden md:block transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-8 h-10 text-sm font-medium text-gray-700 dark:text-gray-200">
            <li>
              <button onClick={() => navigate('/store')} className="hover:text-[#2874f0] dark:hover:text-[#4da3ff] transition-colors">All Categories</button>
            </li>
            <li>
              <button onClick={() => navigate('/store?category=Mobiles')} className="hover:text-[#2874f0] dark:hover:text-[#4da3ff] transition-colors">Mobiles</button>
            </li>
            <li>
              <button onClick={() => navigate('/store?category=Fashion')} className="hover:text-[#2874f0] dark:hover:text-[#4da3ff] transition-colors">Fashion</button>
            </li>
            <li>
              <button onClick={() => navigate('/store?category=Electronics')} className="hover:text-[#2874f0] dark:hover:text-[#4da3ff] transition-colors">Electronics</button>
            </li>
            <li>
              <button onClick={() => navigate('/store?category=Home Appliances')} className="hover:text-[#2874f0] dark:hover:text-[#4da3ff] transition-colors">Home & Furniture</button>
            </li>
            <li>
              <button onClick={() => navigate('/about')} className="hover:text-[#2874f0] dark:hover:text-[#4da3ff] transition-colors">About Us</button>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full bg-white dark:bg-gray-900 transition-colors duration-200">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-white" />
                <span className="font-bold text-white text-xl tracking-tight">LuxeStore</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Elevating your lifestyle with premium quality products. We believe in delivering excellence to your doorstep.
              </p>
              <div className="flex gap-4 pt-2">
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Facebook</a>
                <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors cursor-pointer">Twitter</a>
                <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors cursor-pointer">LinkedIn</a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/store" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/shop" className="hover:text-white transition-colors">Shop Collection</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/page/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Customer Care</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/page/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
                <li><Link to="/page/returns" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
                <li><Link to="/page/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
                <li><Link to="/page/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 shrink-0" />
                  <span>123 Commerce Avenue,<br/>Tech City, 10001</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500 shrink-0" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500 shrink-0" />
                  <span>support@luxestore.com</span>
                </li>
              </ul>
              <button 
                onClick={() => setIsInquiryOpen(true)}
                className="mt-6 w-full py-2.5 px-4 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-sm text-sm"
              >
                Send an Inquiry
              </button>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-sm text-center text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; {new Date().getFullYear()} LuxeStore. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/page/privacy" className="cursor-pointer hover:text-gray-300">Privacy Policy</Link>
              <Link to="/page/terms" className="cursor-pointer hover:text-gray-300">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      <InquiryModal isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
      <LocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} user={user} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ChatbotWidget />
    </div>
  );
};

export default CustomerLayout;
