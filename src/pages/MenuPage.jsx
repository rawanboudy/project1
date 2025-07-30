// src/pages/MenuPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import axios from '../axiosConfig';
import { Star, Loader2, ChevronLeft, ChevronRight, ShoppingCart, Plus, Minus, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import theme from '../theme';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';

const SORT_OPTIONS = [
  { value: '',        label: '–– None ––' },
  { value: 'priceAsc',  label: 'Price: Low → High' },
  { value: 'priceDesc', label: 'Price: High → Low' },
  { value: 'nameAsc',   label: 'Name: A → Z' },
  { value: 'nameDesc',  label: 'Name: Z → A' },
];

export default function MenuPage() {
  const navigate = useNavigate(); // Add navigation hook
  const [allProducts, setAllProducts] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [cartLoading, setCartLoading] = useState({});
  const [cartSuccess, setCartSuccess] = useState({});

  const [brandFilter, setBrandFilter] = useState('');
  const [typeFilter,  setTypeFilter]  = useState('');
  const [search,      setSearch]      = useState('');
  const [sort,        setSort]        = useState('');
  const [pageIndex,   setPageIndex]   = useState(1);
  const [quantities,  setQuantities]  = useState({});
  const pageSize = 8;

  // Fetch once on mount (and on every hard refresh)
  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get('products')
      .then(resp => {
        const products = resp.data.data || [];
        setAllProducts(products);
        // Initialize quantities for all products
        const initialQuantities = {};
        products.forEach(product => {
          initialQuantities[product.id] = 1;
        });
        setQuantities(initialQuantities);
      })
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false));
  }, []);

  // Build unique filter lists
  const brands = useMemo(
    () => ['', ...new Set(allProducts.map(p => p.brandName))],
    [allProducts]
  );
  const types = useMemo(
    () => ['', ...new Set(allProducts.map(p => p.typeName))],
    [allProducts]
  );

  // Apply brand/type/search and sort
  const filtered = useMemo(() => {
    let arr = allProducts;
    if (brandFilter) arr = arr.filter(p => p.brandName === brandFilter);
    if (typeFilter)  arr = arr.filter(p => p.typeName  === typeFilter);
    if (search)      arr = arr.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    switch (sort) {
      case 'priceAsc':
        arr = [...arr].sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        arr = [...arr].sort((a, b) => b.price - a.price);
        break;
      case 'nameAsc':
        arr = [...arr].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        arr = [...arr].sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return arr;
  }, [allProducts, brandFilter, typeFilter, search, sort]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageData   = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageIndex]);

  // Handle quantity changes
  const updateQuantity = (productId, change) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }));
  };

  // Navigate to product details
  const viewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

 // Add to cart function - FIXED VERSION
// Add to cart function - OPTIMIZED VERSION for your API
const addToCart = async (product) => {
  const quantity = quantities[product.id] || 1;
  const productId = product.id;

  setCartLoading(prev => ({ ...prev, [productId]: true }));
  setError('');

  try {
    let basketId = localStorage.getItem('basketId');
    
    // Generate basketId if it doesn't exist
    if (!basketId) {
      basketId = `basket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('basketId', basketId);
    }
    
    // First, try to get existing cart
    let existingCart = null;
    try {
      console.log('Attempting to fetch existing cart with basketId:', basketId);
      const existingResponse = await axios.get(`basket/${basketId}`);
      
      if (existingResponse.data && (existingResponse.status === 200 || existingResponse.status === 201)) {
        existingCart = existingResponse.data;
        console.log('Existing cart found:', existingCart);
      }
    } catch (err) {
      console.log('Cart fetch error:', {
        status: err.response?.status,
        message: err.message,
        data: err.response?.data
      });
      
      // Only treat 404 as "cart not found", other errors should be handled differently
      if (err.response?.status === 404) {
        console.log('Cart not found (404), will create new one');
        existingCart = null;
      } else if (err.response?.status >= 500) {
        // Server error, throw to be caught by outer try-catch
        throw new Error('Server error while fetching cart');
      } else {
        // Other errors (400, 401, 403, etc.) - treat as no existing cart
        console.log('Treating as no existing cart due to error:', err.response?.status);
        existingCart = null;
      }
    }

    // Prepare the new item
    const newItem = {
      id: productId,
      productName: product.name,
      pictureUrl: product.pictureUrl,
      price: product.price,
      quantity: quantity
    };

    let cartData;
    
    // Check if existing cart has valid structure
    if (existingCart && existingCart.items && Array.isArray(existingCart.items)) {
      console.log('Working with existing cart, items:', existingCart.items.length);
      
      // Find existing item
      const existingItemIndex = existingCart.items.findIndex(item => 
        item.id === productId || item.productId === productId
      );
      
      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        existingCart.items[existingItemIndex].quantity += quantity;
        console.log(`Updated existing item quantity to: ${existingCart.items[existingItemIndex].quantity}`);
      } else {
        // Item doesn't exist, add new item
        existingCart.items.push(newItem);
        console.log('Added new item to existing cart');
      }
      
      // Preserve existing cart structure
      cartData = {
        id: basketId,
        items: existingCart.items,
        paymentIntentId: existingCart.paymentIntentId || "",
        deliveryMethodId: existingCart.deliveryMethodId || 0,
        clientSecret: existingCart.clientSecret || "",
        shippingPrice: existingCart.shippingPrice || 0
      };
    } else {
      // No existing cart or invalid cart data, create new one
      console.log('Creating new cart');
      cartData = {
        id: basketId,
        items: [newItem],
        paymentIntentId: "",
        deliveryMethodId: 0,
        clientSecret: "",
        shippingPrice: 0
      };
    }

    console.log('Sending cart data to API:', cartData);
    
    // Send the cart data
    const response = await axios.post('basket', cartData);
    
    console.log('Cart API response:', {
      status: response.status,
      data: response.data
    });
    
    if (response.status === 200 || response.status === 201) {
      // Show success message
      setCartSuccess(prev => ({ ...prev, [productId]: true }));
      setTimeout(() => {
        setCartSuccess(prev => ({ ...prev, [productId]: false }));
      }, 2000);

      console.log('Successfully added to cart');
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
    
  } catch (err) {
    console.error('Cart error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      url: err.config?.url,
      method: err.config?.method
    });
    
    // More specific error messages
    let errorMessage = 'Failed to add item to cart. Please try again.';
    
    if (err.message === 'Server error while fetching cart') {
      errorMessage = 'Unable to load cart. Please try again later.';
    } else if (err.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please check your connection and try again.';
    } else if (err.response?.status === 400) {
      errorMessage = 'Invalid request. Please refresh the page and try again.';
    } else if (err.response?.status === 401) {
      errorMessage = 'Authentication required. Please log in and try again.';
    } else if (err.response?.status === 403) {
      errorMessage = 'Access denied. Please check your permissions.';
    } else if (err.response?.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (err.code === 'NETWORK_ERROR' || !err.response) {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    
    setError(errorMessage);
    
    // Clear the error after 5 seconds
    setTimeout(() => {
      setError('');
    }, 5000);
  } finally {
    setCartLoading(prev => ({ ...prev, [productId]: false }));
  }
};

  return (
    <div className="bg-gradient-to-b from-white to-gray-100 min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <header className="relative h-80 flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-600">
        <div className="text-center px-4">
          <h1 className="text-5xl font-bold text-white mb-2">
            Explore Our Culinary Creations
          </h1>
          <p className="text-lg text-orange-200 max-w-xl mx-auto">
            Handcrafted dishes, curated flavors. Refine your search with our filters.
          </p>
        </div>
      </header>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 px-6 -mt-20">
        {/* Sidebar Filters */}
        <aside className="md:col-span-1 bg-white rounded-xl shadow-lg p-6 sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="space-y-4">
            {/* Brand */}
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <select
                className="w-full p-2 border rounded-md focus:ring focus:ring-orange-200"
                value={brandFilter}
                onChange={e => { setBrandFilter(e.target.value); setPageIndex(1); }}
              >
                {brands.map(b => (
                  <option key={b} value={b}>
                    {b || 'All Brands'}
                  </option>
                ))}
              </select>
            </div>
            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="w-full p-2 border rounded-md focus:ring focus:ring-orange-200"
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value); setPageIndex(1); }}
              >
                {types.map(t => (
                  <option key={t} value={t}>
                    {t || 'All Types'}
                  </option>
                ))}
              </select>
            </div>
            {/* Sort */}
            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                className="w-full p-2 border rounded-md focus:ring focus:ring-orange-200"
                value={sort}
                onChange={e => { setSort(e.target.value); setPageIndex(1); }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md focus:ring focus:ring-orange-200"
                placeholder="Search dishes..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPageIndex(1); }}
              />
            </div>
          </div>
        </aside>

        {/* Products List */}
        <section className="md:col-span-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
          ) : (
            <motion.div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pageData.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition flex flex-col h-full"
                >
                  <div className="overflow-hidden h-48 flex-shrink-0">
                    <img
                      src={item.pictureUrl}
                      alt={item.name}
                     
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-4 flex-grow">
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2 min-h-[3.5rem]" style={{ color: theme.colors.textDark }}>
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 min-h-[4rem]">
                        {item.description}
                      </p>
                    </div>
                    
                    {/* Price and Rating */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-extrabold" style={{ color: theme.colors.orange }}>
                        ${(item.price || 0).toFixed(2)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {item.rating?.toFixed(1) || '–'}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-700">Quantity:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {quantities[item.id] || 1}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Button Container - Fixed positioning */}
                    <div className="space-y-2 mt-auto">
                      {/* View Product Button */}
                      <button
                        onClick={() => viewProduct(item.id)}
                        className="w-full py-3 px-4 rounded-full font-medium transition-all duration-200 flex items-center justify-center space-x-2 bg-gray-600 text-white hover:bg-gray-700 hover:scale-105 transform"
                      >
                        <Eye className="w-5 h-5" />
                        <span>View Product</span>
                      </button>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => addToCart(item)}
                        disabled={cartLoading[item.id]}
                        className={`w-full py-3 px-4 rounded-full font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                          cartSuccess[item.id]
                            ? 'bg-green-500 text-white'
                            : cartLoading[item.id]
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700 hover:scale-105 transform'
                        }`}
                      >
                        {cartLoading[item.id] ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : cartSuccess[item.id] ? (
                          <>
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setPageIndex(n => Math.max(1, n - 1))}
              disabled={pageIndex === 1}
              className="flex items-center space-x-1 px-3 py-1 bg-white border rounded-lg shadow hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Prev</span>
            </button>
            <span className="font-medium">Page {pageIndex} of {totalPages}</span>
            <button
              onClick={() => setPageIndex(n => Math.min(totalPages, n + 1))}
              disabled={pageIndex === totalPages}
              className="flex items-center space-x-1 px-3 py-1 bg-white border rounded-lg shadow hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}