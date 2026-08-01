import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Truck, RotateCcw, ShieldCheck, MapPin, ChevronRight, HelpCircle } from 'lucide-react';

const pagesData = {
  faq: {
    title: 'Frequently Asked Questions',
    content: (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="w-8 h-8 text-[#2874f0]" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">Find answers to common questions below.</p>
        </div>
        {[
          { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards, UPI, Net Banking, and popular wallets via Razorpay. We also offer Cash on Delivery (COD) for eligible pin codes.' },
          { q: 'How long will it take to receive my order?', a: 'Standard delivery typically takes 5-7 business days depending on your location. Expedited shipping is available at checkout for delivery within 2-3 business days.' },
          { q: 'Can I change or cancel my order?', a: 'You can cancel your order before it has been dispatched from our warehouse. Once the shipping process has started, we cannot cancel it, but you may return it under our Returns Policy.' },
          { q: 'How do I track my shipment?', a: 'Once your order is shipped, you will receive an email and SMS with the tracking link. You can also visit our Track Order page and enter your Order ID.' },
          { q: 'Do you ship internationally?', a: 'Currently, we only ship within India. We are working on expanding our delivery network globally in the near future.' }
        ].map((faq, idx) => (
          <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-[#2874f0] dark:hover:border-[#2874f0] transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-start gap-2">
              <span className="text-[#2874f0] mt-1">Q.</span> {faq.q}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 ml-6">{faq.a}</p>
          </div>
        ))}
      </div>
    )
  },
  'track-order': {
    title: 'Track Your Order',
    content: (
      <div className="space-y-8 text-center py-8">
        <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100 dark:border-blue-800/50">
          <MapPin className="w-10 h-10 text-[#2874f0] dark:text-[#4da3ff]" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Real-time tracking coming soon</h3>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">
          To track your current order, please check the tracking link sent to your registered email address or phone number via SMS.
        </p>
        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 max-w-lg mx-auto mt-8 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            If you haven't received a tracking link within 48 hours of placing your order, please contact our support team.
          </p>
        </div>
      </div>
    )
  },
  returns: {
    title: 'Returns & Exchanges',
    content: (
      <div className="space-y-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 border border-blue-100 dark:border-blue-800/30 shadow-sm">
          <div className="w-16 h-16 bg-white dark:bg-blue-800 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-blue-50 dark:border-blue-700">
            <RotateCcw className="w-8 h-8 text-[#2874f0] dark:text-[#4da3ff]" />
          </div>
          <p className="text-xl font-medium text-blue-900 dark:text-blue-100 text-center sm:text-left">
            Hassle-free 14-day return policy for all eligible items.
          </p>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
          We want you to be completely satisfied with your purchase. If for any reason you are not, we gladly accept returns and exchanges within 14 days of delivery.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[#2874f0] dark:text-[#4da3ff] font-bold text-sm shadow-sm">1</span>
              Conditions for Return
            </h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-5 h-5 text-[#2874f0] shrink-0" />
                Items must be unused, unwashed, and in their original condition.
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-5 h-5 text-[#2874f0] shrink-0" />
                All original tags and packaging must remain intact.
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-5 h-5 text-[#2874f0] shrink-0" />
                Clearance or sale items may not be eligible for returns.
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm shadow-sm">2</span>
              Refund Process
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. Approved refunds will be processed back to your original method of payment within 5-7 business days.
            </p>
          </div>
        </div>
      </div>
    )
  },
  shipping: {
    title: 'Shipping Policy',
    content: (
      <div className="space-y-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 border border-blue-100 dark:border-blue-800/30 shadow-sm">
          <div className="w-16 h-16 bg-white dark:bg-blue-800 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-blue-50 dark:border-blue-700">
            <Truck className="w-8 h-8 text-[#2874f0] dark:text-[#4da3ff]" />
          </div>
          <p className="text-xl font-medium text-blue-900 dark:text-blue-100 text-center sm:text-left">
            Fast and secure delivery across the country.
          </p>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
          We partner with top-tier courier services to ensure your orders reach you safely and on time.
        </p>

        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Processing Time</h3>
            <p className="text-gray-600 dark:text-gray-300">
              All orders are processed within 24-48 hours. Orders are not shipped or delivered on weekends or public holidays.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Shipping Rates</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col h-full hover:border-[#2874f0] dark:hover:border-[#4da3ff] transition-colors shadow-sm cursor-default">
                <span className="text-xs font-bold text-[#2874f0] dark:text-[#4da3ff] uppercase tracking-wider mb-2 flex items-center gap-2">
                  Standard Shipping
                </span>
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">₹99</span>
                <span className="inline-block bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-bold px-2.5 py-1 rounded-full w-fit mb-3">
                  Free over ₹2,000
                </span>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-auto">Takes 5-7 business days.</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col h-full hover:border-[#2874f0] dark:hover:border-[#4da3ff] transition-colors shadow-sm cursor-default">
                <span className="text-xs font-bold text-[#2874f0] dark:text-[#4da3ff] uppercase tracking-wider mb-2 flex items-center gap-2">
                  Express Shipping
                </span>
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">₹199</span>
                <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold px-2.5 py-1 rounded-full w-fit mb-3">
                  Flat rate
                </span>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-auto">Takes 2-3 business days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  terms: {
    title: 'Terms & Conditions',
    content: (
      <div className="space-y-8">
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          Welcome to <span className="font-bold text-gray-900 dark:text-white">LuxeStore</span>. These terms and conditions outline the rules and regulations for the use of our website.
        </p>
        
        <div className="space-y-6">
          {[
            { title: '1. Acceptance of Terms', desc: 'By accessing this website, we assume you accept these terms and conditions. Do not continue to use LuxeStore if you do not agree to take all of the terms and conditions stated on this page.' },
            { title: '2. Product Accuracy', desc: 'We make every effort to display as accurately as possible the colors and images of our products. However, we cannot guarantee that your computer monitor\'s display of any color will be accurate.' },
            { title: '3. Pricing and Payments', desc: 'Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service without notice. All payments must be received in full prior to dispatch unless Cash on Delivery is selected.' },
            { title: '4. User Account', desc: 'If you create an account on our website, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account.' },
            { title: '5. Intellectual Property', desc: 'Unless otherwise stated, LuxeStore and/or its licensors own the intellectual property rights for all material on the website. All intellectual property rights are reserved.' }
          ].map((term, idx) => (
            <section key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{term.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{term.desc}</p>
            </section>
          ))}
        </div>
      </div>
    )
  },
  privacy: {
    title: 'Privacy Policy',
    content: (
      <div className="space-y-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 border border-blue-100 dark:border-blue-800/30 shadow-sm">
          <div className="w-16 h-16 bg-white dark:bg-blue-800 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-blue-50 dark:border-blue-700">
            <ShieldCheck className="w-8 h-8 text-[#2874f0] dark:text-[#4da3ff]" />
          </div>
          <p className="text-xl font-medium text-blue-900 dark:text-blue-100 text-center sm:text-left">
            Your privacy and data security are our top priorities.
          </p>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
          This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from LuxeStore.
        </p>
        
        <div className="space-y-6">
          <section className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Personal Information We Collect</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              When you make a purchase, we collect certain information from you, including your name, billing address, shipping address, payment information, email address, and phone number.
            </p>
          </section>

          <section className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">How We Use Your Information</h3>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-5 h-5 text-[#2874f0] shrink-0" />
                To fulfill any orders placed through the Site (including processing your payment information and arranging for shipping).
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-5 h-5 text-[#2874f0] shrink-0" />
                To communicate with you regarding your order or inquiries.
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-5 h-5 text-[#2874f0] shrink-0" />
                To screen our orders for potential risk or fraud.
              </li>
            </ul>
          </section>

          <section className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Data Retention</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.
            </p>
          </section>
        </div>
      </div>
    )
  }
};

const StaticPage = () => {
  const { pageId } = useParams();
  const page = pagesData[pageId] || { 
    title: 'Page Not Found', 
    content: <div className="py-12 text-center text-gray-500 dark:text-gray-400">The page you are looking for does not exist or has been moved.</div> 
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200 animate-fade-in">
          
          {/* Header Area */}
          <div className="bg-gradient-to-r from-[#2874f0] to-blue-500 dark:from-blue-900 dark:to-indigo-900 px-8 py-12 md:px-12 md:py-16 text-center transition-colors">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">{page.title}</h1>
            <div className="w-16 h-1 bg-white/40 mx-auto rounded-full"></div>
          </div>

          {/* Content Area */}
          <div className="p-8 md:p-12">
            {page.content}
            
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700 flex justify-center">
              <Link to="/store" className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm">
                &larr; Return to Store
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StaticPage;
