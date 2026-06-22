import React from 'react';
import { ShoppingBag, Heart, ShieldCheck, Truck } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-16 px-4 sm:px-6 lg:px-8 min-h-screen transition-colors duration-200">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center items-center gap-3 mb-6">
          <ShoppingBag className="w-10 h-10 text-[#2874f0] dark:text-[#4da3ff]" />
          <h1 className="text-4xl font-extrabold tracking-tight italic">LuxeStore</h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
          Elevating your everyday lifestyle with premium quality products, unbeatable prices, and lightning-fast delivery to your doorstep.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl text-center shadow-sm">
          <div className="bg-[#2874f0]/10 dark:bg-[#4da3ff]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-[#2874f0] dark:text-[#4da3ff]" />
          </div>
          <h3 className="text-xl font-bold mb-2">Customer First</h3>
          <p className="text-gray-600 dark:text-gray-400">
            We put our customers at the heart of everything we do. Your satisfaction is our primary goal and we work tirelessly to ensure a seamless shopping experience.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl text-center shadow-sm">
          <div className="bg-[#2874f0]/10 dark:bg-[#4da3ff]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-[#2874f0] dark:text-[#4da3ff]" />
          </div>
          <h3 className="text-xl font-bold mb-2">Guaranteed Quality</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Every product on LuxeStore is vetted for the highest quality. We partner with top-tier brands and suppliers to bring you products you can trust.
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl text-center shadow-sm">
          <div className="bg-[#2874f0]/10 dark:bg-[#4da3ff]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-[#2874f0] dark:text-[#4da3ff]" />
          </div>
          <h3 className="text-xl font-bold mb-2">Fast & Secure Delivery</h3>
          <p className="text-gray-600 dark:text-gray-400">
            With an optimized logistics network, we ensure your packages arrive securely and faster than ever, keeping you informed at every step.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-[#2874f0] text-white rounded-3xl p-10 text-center shadow-lg">
        <h2 className="text-3xl font-bold mb-4">Our Story</h2>
        <p className="text-lg text-blue-100 leading-relaxed">
          Founded with a simple vision to make premium shopping accessible to everyone, LuxeStore has grown into a destination trusted by thousands. What started as a small local initiative has blossomed into an online hub where style, quality, and convenience meet. Thank you for making us a part of your daily lives!
        </p>
      </div>
    </div>
  );
};

export default About;
