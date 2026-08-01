import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ShoppingBag, CheckCircle } from 'lucide-react';

const AuthLayout = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Left Side - Info Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#2874f0] dark:bg-blue-900 text-white flex-col justify-between p-12 lg:p-20 relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-white blur-3xl"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-400 blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <Link to="/store" className="flex items-center gap-3 w-max">
            <ShoppingBag className="w-10 h-10 text-yellow-400" />
            <span className="font-extrabold text-3xl tracking-tight italic">LuxeStore</span>
          </Link>
        </div>

        <div className="relative z-10 my-auto">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Elevate Your <br /> Shopping Experience.
          </h1>
          <p className="text-blue-100 text-lg mb-10 max-w-md leading-relaxed">
            Discover a curated collection of premium products, exclusive offers, and seamless delivery right to your doorstep. Join our community today.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-yellow-400 shrink-0" />
              <span className="text-blue-50 font-medium">100% Authentic Premium Products</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-yellow-400 shrink-0" />
              <span className="text-blue-50 font-medium">Fast & Secure Nationwide Delivery</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-yellow-400 shrink-0" />
              <span className="text-blue-50 font-medium">Hassle-free 14 Days Return Policy</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-blue-200">
          &copy; {new Date().getFullYear()} LuxeStore. All rights reserved.
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-12 lg:px-24 bg-gray-50 dark:bg-gray-900 relative">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-6 sm:left-12 flex items-center gap-2">
          <ShoppingBag className="w-8 h-8 text-[#2874f0] dark:text-[#4da3ff]" />
          <span className="font-extrabold text-2xl text-gray-900 dark:text-white tracking-tight italic">LuxeStore</span>
        </div>

        <div className="w-full max-w-md mx-auto pt-16 lg:pt-0">
          <div className="bg-white dark:bg-gray-800 py-10 px-8 shadow-xl shadow-gray-200/50 dark:shadow-none sm:rounded-2xl border border-gray-100 dark:border-gray-700 transition-colors duration-200 animate-fade-in">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
