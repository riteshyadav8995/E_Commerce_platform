import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import useCartStore from '../../store/cartStore';
import { ShoppingCart, Plus, ShoppingBag, ChevronLeft, ChevronRight, Star, SortAsc, SortDesc } from 'lucide-react';

const BANNERS = [
  { id: 1, src: '/assets/images/banner_electronics_1782101135985.png', alt: 'Mega Electronics Sale' },
  { id: 2, src: '/assets/images/banner_fashion_1782101148430.png', alt: 'Fashion Week Sale' }
];

const Storefront = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCartStore();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || '';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products?status=active'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-sliding carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);

  // Filter and Sort Logic
  const filteredProducts = products
    .filter(p => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (categoryFilter && p.category?.name !== categoryFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
      return 0; // Default: newest first typically, but we'll leave it as returned
    });

  const toggleSort = () => {
    const nextSort = sortBy === 'price_asc' ? 'price_desc' : 'price_asc';
    setSearchParams(prev => {
      prev.set('sort', nextSort);
      return prev;
    });
  };

  return (
    <div className="bg-[#f1f3f6] dark:bg-gray-900 min-h-screen pb-10 transition-colors duration-200">
      
      {/* Category Strip (Flipkart style) */}
      <div className="bg-white dark:bg-gray-800 shadow-sm mb-4 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto hide-scrollbar">
          <div className="flex gap-8 items-center min-w-max justify-center md:justify-start lg:justify-center">
            <div 
              className="flex flex-col items-center gap-1 cursor-pointer group"
              onClick={() => navigate('/store')}
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-2 group-hover:shadow-md transition-shadow">
                <ShoppingBag className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-[#2874f0] dark:group-hover:text-[#4da3ff] transition-colors">Top Offers</span>
            </div>

            {categories.map(cat => (
              <div 
                key={cat.id} 
                className="flex flex-col items-center gap-1 cursor-pointer group"
                onClick={() => navigate(`/store?category=${cat.name}`)}
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-2 overflow-hidden group-hover:shadow-md transition-shadow">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                  ) : (
                    <ShoppingBag className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <span className={`text-sm font-medium ${categoryFilter === cat.name ? 'text-[#2874f0] dark:text-[#4da3ff]' : 'text-gray-800 dark:text-gray-200'} group-hover:text-[#2874f0] dark:group-hover:text-[#4da3ff] transition-colors`}>
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Hero Carousel */}
        {(!searchQuery && !categoryFilter) && (
          <div className="relative w-full h-[300px] md:h-[400px] bg-white rounded-sm overflow-hidden shadow-sm group">
            <div 
              className="flex w-full h-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {BANNERS.map(banner => (
                <img 
                  key={banner.id}
                  src={banner.src} 
                  alt={banner.alt} 
                  className="w-full h-full flex-shrink-0 object-cover"
                />
              ))}
            </div>
            
            <button 
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 w-10 h-16 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-r-md shadow-md"
            >
              <ChevronLeft className="w-8 h-8 text-gray-800" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 w-10 h-16 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-l-md shadow-md"
            >
              <ChevronRight className="w-8 h-8 text-gray-800" />
            </button>
          </div>
        )}

        {/* Search & Sort Header */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
          <div>
            {searchQuery && <h2 className="text-xl font-bold dark:text-white">Showing results for "{searchQuery}"</h2>}
            {categoryFilter && !searchQuery && <h2 className="text-xl font-bold dark:text-white">{categoryFilter} Products</h2>}
            {(!searchQuery && !categoryFilter) && <h2 className="text-xl font-bold dark:text-white">Recommended for You</h2>}
            <p className="text-sm text-gray-500 dark:text-gray-400">(Showing {filteredProducts.length} products)</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Sort By:</span>
            <button 
              onClick={toggleSort}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium dark:text-gray-200 transition-colors"
            >
              {sortBy === 'price_desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
              Price {sortBy === 'price_desc' ? 'High to Low' : 'Low to High'}
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-sm shadow-sm transition-colors duration-200">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-4 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No products found!</p>
              <p className="text-sm">Try modifying your search or category filter.</p>
              <button 
                onClick={() => navigate('/store')} 
                className="mt-4 px-6 py-2 bg-[#2874f0] text-white rounded-sm font-medium shadow-sm hover:bg-blue-600"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="group relative flex flex-col hover:shadow-xl transition-shadow border border-transparent hover:border-gray-100 dark:hover:border-gray-700 rounded-md overflow-hidden bg-white dark:bg-gray-800 cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="h-48 p-4 flex items-center justify-center relative bg-white dark:bg-gray-800">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <ShoppingBag className="w-12 h-12 text-gray-200" />
                    )}
                    {/* Add to cart overlay button (Flipkart style) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="absolute bottom-2 right-2 w-8 h-8 md:w-10 md:h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-[#2874f0] hover:border-[#2874f0] shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                      title="Add to Cart"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col border-t border-gray-100 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 text-sm mb-1 group-hover:text-[#2874f0] dark:group-hover:text-[#4da3ff] transition-colors">{product.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        4.4 <Star className="w-3 h-3 fill-current" />
                      </span>
                      <span className="text-gray-400 text-xs">(1,234)</span>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base md:text-lg font-bold text-gray-900 dark:text-white">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
                        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-through">₹{(parseFloat(product.price) * 1.4).toLocaleString('en-IN')}</span>
                        <span className="text-[10px] md:text-xs font-bold text-green-600">28% off</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Free delivery</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Storefront;
