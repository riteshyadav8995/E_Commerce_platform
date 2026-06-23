import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../../services/productService';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import { ChevronLeft, ChevronRight, ShoppingCart, CreditCard, ArrowLeft } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore(state => state.addToCart);
  const { isAuthenticated } = useAuthStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductById(id);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!product) return <div className="flex justify-center items-center h-screen">Product not found.</div>;

  const images = (product.images && product.images.length > 0) 
    ? product.images 
    : (product.imageUrl ? [product.imageUrl] : []);

  const nextImage = () => setCurrentImageIdx((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    window.dispatchEvent(new CustomEvent('open-cart')); // triggers the global cart open
  };

  const handleOrderNow = () => {
    // Add to cart and immediately redirect to checkout or login if not authenticated
    addToCart(product, quantity);
    if (!isAuthenticated) {
      navigate('/login?checkout=true');
    } else {
      // Assuming a checkout route exists or will be implemented
      // For now, let's open cart so they can checkout
      window.dispatchEvent(new CustomEvent('open-cart'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-200">
      <button onClick={() => navigate('/store')} className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Store
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row transition-colors duration-200">
        
        {/* Left: Image Gallery */}
        <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-900 p-8 flex flex-col items-center justify-center relative min-h-[400px] transition-colors duration-200">
          {images.length > 0 ? (
            <>
              <div className="relative w-full h-[400px] flex items-center justify-center rounded-xl overflow-hidden shadow-sm">
                <img src={images[currentImageIdx]} alt={product.name} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
              </div>
              
              {/* Slider Controls */}
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </button>
                  
                  {/* Thumbnails */}
                  <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setCurrentImageIdx(idx)}
                        className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${currentImageIdx === idx ? 'border-primary-600' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={img} className="w-full h-full object-cover" alt="Thumbnail" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-gray-400 flex flex-col items-center">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
              <p>No images available</p>
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          <div className="mb-2 text-sm text-primary-600 font-semibold tracking-wide uppercase">
            {product.category?.name || 'Uncategorized'}
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{parseFloat(product.price).toFixed(2)}</span>
            {parseFloat(product.tax) > 0 && <span className="text-sm text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">+{product.tax}% Tax</span>}
          </div>
          
          <div className="prose text-gray-600 dark:text-gray-300 mb-8 max-w-none">
            {product.description ? (
              <p className="whitespace-pre-line">{product.description}</p>
            ) : (
              <p className="italic text-gray-400">No description provided for this product.</p>
            )}
          </div>
          
          <div className="mb-8 border-t border-b border-gray-100 dark:border-gray-700 py-6">
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</span>
              <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 w-32">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-lg transition-colors"
                >-</button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 h-10 text-center bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white font-medium p-0"
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-lg transition-colors"
                >+</button>
              </div>
            </div>
          </div>
          
          <div className="mt-auto flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-white border-2 border-primary-600 text-primary-600 py-4 px-6 rounded-xl font-bold hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <button 
              onClick={handleOrderNow}
              className="flex-1 bg-primary-600 border-2 border-primary-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-primary-700 hover:border-primary-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
            >
              <CreditCard className="w-5 h-5" />
              Order Now
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
