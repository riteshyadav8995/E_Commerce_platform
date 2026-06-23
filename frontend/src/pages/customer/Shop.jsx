import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useCartStore from '../../store/cartStore';
import { ShoppingCart, Plus, ChevronRight, ChevronLeft } from 'lucide-react';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  
  // Local state for liked products (stored in localStorage)
  const [likedProducts, setLikedProducts] = useState(() => {
    const saved = localStorage.getItem('likedProducts');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const toggleLike = (e, productId) => {
    e.stopPropagation();
    setLikedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      localStorage.setItem('likedProducts', JSON.stringify([...next]));
      return next;
    });
  };
  
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = '/products?';
        if (category) url += `category=${encodeURIComponent(category)}&`;
        if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

        const response = await api.get(url);
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, searchQuery]);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen pb-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center justify-between mb-8 bg-white dark:bg-gray-800 p-4 rounded-sm shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {category ? `${category} Collection` : searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Showing {products.length} items</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Sort by:</span>
            <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option>Relevance</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2874f0] border-t-transparent"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-sm shadow-sm">
            <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/batman-returns/images/error-500.png" alt="No products" className="h-40 mx-auto opacity-50 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Sorry, no results found!</h3>
            <p className="text-gray-500 dark:text-gray-400">Please check the spelling or try searching for something else</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((product) => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-white dark:bg-gray-800 p-4 rounded-sm hover:shadow-xl transition-shadow group flex flex-col relative cursor-pointer"
              >
                <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={(e) => toggleLike(e, product.id)}
                    className={`${likedProducts.has(product.id) ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors`}
                  >
                    <svg className="w-5 h-5" fill={likedProducts.has(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </button>
                </div>
                
                <div className="aspect-[4/5] w-full mb-4 overflow-hidden relative">
                  <img 
                    src={product.imageUrl || 'https://via.placeholder.com/300?text=No+Image'} 
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="flex-1 flex flex-col">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-[#2874f0] dark:hover:text-[#4da3ff] cursor-pointer">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <span className="bg-green-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      4.5 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">(2,145)</span>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">₹{product.price}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">₹{Math.floor(product.price * 1.4)}</span>
                      <span className="text-xs font-bold text-green-600">28% off</span>
                    </div>
                    {product.stock <= 5 && product.stock > 0 && (
                      <p className="text-xs text-red-500 mt-1">Only {product.stock} left!</p>
                    )}
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      disabled={product.stock === 0}
                      className="w-full mt-3 flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 py-2 rounded-sm hover:bg-[#2874f0] hover:text-white hover:border-[#2874f0] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
