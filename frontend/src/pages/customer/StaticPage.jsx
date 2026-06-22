import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Truck, RotateCcw, ShieldCheck, MapPin } from 'lucide-react';

const pagesData = {
  faq: {
    title: 'Frequently Asked Questions',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">1. What payment methods do you accept?</h3>
          <p>We accept all major credit and debit cards, UPI, Net Banking, and popular wallets via Razorpay. We also offer Cash on Delivery (COD) for eligible pin codes.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">2. How long will it take to receive my order?</h3>
          <p>Standard delivery typically takes 5-7 business days depending on your location. Expedited shipping is available at checkout for delivery within 2-3 business days.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Can I change or cancel my order?</h3>
          <p>You can cancel your order before it has been dispatched from our warehouse. Once the shipping process has started, we cannot cancel it, but you may return it under our Returns Policy.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">4. How do I track my shipment?</h3>
          <p>Once your order is shipped, you will receive an email and SMS with the tracking link. You can also visit our 'Track Order' page and enter your Order ID.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">5. Do you ship internationally?</h3>
          <p>Currently, we only ship within India. We are working on expanding our delivery network globally in the near future.</p>
        </div>
      </div>
    )
  },
  'track-order': {
    title: 'Track Your Order',
    content: (
      <div className="space-y-6 text-center py-8">
        <MapPin className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900">Real-time tracking coming soon</h3>
        <p>To track your current order, please check the tracking link sent to your registered email address or phone number via SMS.</p>
        <p className="text-sm text-gray-500">If you haven't received a tracking link within 48 hours of placing your order, please contact our support team.</p>
      </div>
    )
  },
  returns: {
    title: 'Returns & Exchanges',
    content: (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <RotateCcw className="w-8 h-8 text-indigo-600" />
          <p className="text-lg font-medium text-gray-900">Hassle-free 14-day return policy.</p>
        </div>
        <p>We want you to be completely satisfied with your purchase. If for any reason you are not, we gladly accept returns and exchanges within 14 days of delivery.</p>
        <h3 className="text-lg font-semibold text-gray-900 mt-6">Conditions for Return:</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Items must be unused, unwashed, and in their original condition.</li>
          <li>All original tags and packaging must remain intact.</li>
          <li>Clearance or sale items may not be eligible for returns.</li>
        </ul>
        <h3 className="text-lg font-semibold text-gray-900 mt-6">Refund Process:</h3>
        <p>Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. Approved refunds will be processed back to your original method of payment within 5-7 business days.</p>
      </div>
    )
  },
  shipping: {
    title: 'Shipping Policy',
    content: (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Truck className="w-8 h-8 text-indigo-600" />
          <p className="text-lg font-medium text-gray-900">Fast and secure delivery across the country.</p>
        </div>
        <p>We partner with top-tier courier services to ensure your orders reach you safely and on time.</p>
        <h3 className="text-lg font-semibold text-gray-900 mt-6">Processing Time:</h3>
        <p>All orders are processed within 24-48 hours. Orders are not shipped or delivered on weekends or public holidays.</p>
        <h3 className="text-lg font-semibold text-gray-900 mt-6">Shipping Rates:</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Standard Shipping:</strong> ₹99 (Free on orders over ₹2,000). Takes 5-7 business days.</li>
          <li><strong>Express Shipping:</strong> ₹199. Takes 2-3 business days.</li>
        </ul>
      </div>
    )
  },
  terms: {
    title: 'Terms & Conditions',
    content: (
      <div className="space-y-6">
        <p>Welcome to LuxeStore. These terms and conditions outline the rules and regulations for the use of our website.</p>
        
        <h3 className="text-lg font-semibold text-gray-900 mt-6">1. Acceptance of Terms</h3>
        <p>By accessing this website, we assume you accept these terms and conditions. Do not continue to use LuxeStore if you do not agree to take all of the terms and conditions stated on this page.</p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6">2. Product Accuracy</h3>
        <p>We make every effort to display as accurately as possible the colors and images of our products. However, we cannot guarantee that your computer monitor's display of any color will be accurate.</p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6">3. Pricing and Payments</h3>
        <p>Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service without notice. All payments must be received in full prior to dispatch unless Cash on Delivery is selected.</p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6">4. User Account</h3>
        <p>If you create an account on our website, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account.</p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6">5. Intellectual Property</h3>
        <p>Unless otherwise stated, LuxeStore and/or its licensors own the intellectual property rights for all material on the website. All intellectual property rights are reserved.</p>
      </div>
    )
  },
  privacy: {
    title: 'Privacy Policy',
    content: (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-8 h-8 text-indigo-600" />
          <p className="text-lg font-medium text-gray-900">Your privacy and data security are our top priorities.</p>
        </div>
        <p>This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from LuxeStore.</p>
        
        <h3 className="text-lg font-semibold text-gray-900 mt-6">Personal Information We Collect</h3>
        <p>When you make a purchase, we collect certain information from you, including your name, billing address, shipping address, payment information, email address, and phone number.</p>

        <h3 className="text-lg font-semibold text-gray-900 mt-6">How We Use Your Information</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>To fulfill any orders placed through the Site (including processing your payment information and arranging for shipping).</li>
          <li>To communicate with you regarding your order or inquiries.</li>
          <li>To screen our orders for potential risk or fraud.</li>
        </ul>

        <h3 className="text-lg font-semibold text-gray-900 mt-6">Data Retention</h3>
        <p>When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.</p>
      </div>
    )
  }
};

const StaticPage = () => {
  const { pageId } = useParams();
  const page = pagesData[pageId] || { 
    title: 'Page Not Found', 
    content: <p>The page you are looking for does not exist or has been moved.</p> 
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{page.title}</h1>
        <div className="text-gray-600 text-base md:text-lg leading-relaxed">
          {page.content}
        </div>
        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link to="/store" className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
            &larr; Return to Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StaticPage;
