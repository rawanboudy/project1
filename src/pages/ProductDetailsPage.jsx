import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../axiosConfig';
import { 
  Loader2, 
  Star, 
  ShoppingCart, 
  Share2, 
  Plus, 
  Minus, 
  ArrowLeft,
  Check,
  Zap,
  AlertCircle,
  LogIn
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import toast from 'react-hot-toast';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [authNotification, setAuthNotification] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    return !!(token && userInfo);
  };

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Check authentication status
    setIsLoggedIn(checkAuthStatus());
    
    axios.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => setError('Failed to load product details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateQuantity = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleAuthRedirect = () => {
    // Show toast notification
    toast.error('Please log in to add items to cart');
    
    // Show floating notification
    setAuthNotification(true);
    
    // Navigate to login after a short delay
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  const addToCart = async () => {
    if (!product) return;

    // Check if user is logged in
    if (!checkAuthStatus()) {
      handleAuthRedirect();
      return;
    }

    setCartLoading(true);
    setError('');

    try {
      let basketId = localStorage.getItem('basketId');
      if (!basketId) {
        basketId = Math.random().toString(36).substr(2, 9);
        localStorage.setItem('basketId', basketId);
      }

      // Try get existing cart
      let existingCart = null;
      try {
        const response = await axios.get(`/basket/${basketId}`);
        existingCart = response.data;
      } catch (err) {
        if (err.response?.status !== 404) throw err;
      }

      const newItem = {
        id: product.id,
        productName: product.name,
        pictureUrl: product.pictureUrl,
        price: product.price,
        quantity: quantity
      };

      let updatedItems = [];
      if (existingCart && existingCart.items) {
        const existingIndex = existingCart.items.findIndex(
          item => item.id === product.id
        );
        if (existingIndex >= 0) {
          existingCart.items[existingIndex].quantity += quantity;
          updatedItems = existingCart.items;
        } else {
          updatedItems = [...existingCart.items, newItem];
        }
      } else {
        updatedItems = [newItem];
      }

      const updatedCart = {
        id: basketId,
        items: updatedItems,
        paymentIntentId: existingCart?.paymentIntentId || '',
        deliveryMethodId: existingCart?.deliveryMethodId || 0,
        clientSecret: existingCart?.clientSecret || '',
        shippingPrice: existingCart?.shippingPrice || 0,
      };

      await axios.post('/basket', updatedCart);
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      
      // Check if it's an authentication error
      if (err.response?.status === 401) {
        // Token might be expired, clear auth data and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('userPermissions');
        localStorage.removeItem('userRoles');
        localStorage.removeItem('sessionId');
        delete axios.defaults.headers.common['Authorization'];
        
        setIsLoggedIn(false);
        handleAuthRedirect();
        return;
      }
      
      setError('Failed to add item to cart. Please try again.');
    } finally {
      setCartLoading(false);
    }
  };

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center h-96 pt-20">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-16 pt-24">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={() => navigate('/menu')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Menu
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-16 pt-24">
          <p className="text-center text-gray-600">Product not found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen">
      <Navbar />

 

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-6 py-4 pt-24">
        
      </div>

      <main className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative bg-white rounded-xl shadow-lg overflow-hidden group hover:scale-105 transition-all duration-200">
              <img
                src={product.pictureUrl}
                alt={product.name}
               
                className="w-full h-80 lg:h-96 object-cover transition-transform duration-700"
              />
              <button
                onClick={shareProduct}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-600 hover:text-orange-600 hover:bg-white transition-all duration-200 shadow-lg"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Right: Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Product Title & Rating */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    ({product.rating?.toFixed(1) || 'N/A'})
                  </span>
                </div>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-green-600 font-medium">In Stock</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-orange-600">
                ${product.price?.toFixed(2)}
              </span>
              <span className="text-lg text-gray-400 line-through">
                ${(product.price * 1.2)?.toFixed(2)}
              </span>
              <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-md">
                20% OFF
              </span>
            </div>

            {/* Product Info */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-sm bg-orange-50 text-orange-700 border border-orange-200">
                {product.brandName || 'Premium Brand'}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
                {product.typeName || 'Specialty'}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-green-50 text-green-700 border border-green-200">
                <Zap className="w-3 h-3 inline mr-1" />
                Fast Delivery
              </span>
            </div>

            {/* Authentication Warning for Non-logged Users */}
            {!isLoggedIn && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-orange-800 font-medium mb-1">
                    Sign in required
                  </p>
                  <p className="text-sm text-orange-700">
                    Please log in to your account to add items to your cart and enjoy a personalized shopping experience.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => updateQuantity(-1)}
                  className="p-2 hover:bg-gray-50 transition-colors duration-200"
                  disabled={!isLoggedIn}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-medium bg-gray-50 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(1)}
                  className="p-2 hover:bg-gray-50 transition-colors duration-200"
                  disabled={!isLoggedIn}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              whileHover={isLoggedIn ? { scale: 1.02 } : {}}
              whileTap={isLoggedIn ? { scale: 0.98 } : {}}
              onClick={addToCart}
              disabled={cartLoading}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
                cartSuccess
                  ? 'bg-green-500 text-white'
                  : cartLoading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : !isLoggedIn
                  ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700'
                  : 'bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700'
              }`}
            >
              {cartLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : cartSuccess ? (
                <>
                  <Check className="w-5 h-5" />
                  Added to Cart!
                </>
              ) : !isLoggedIn ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In to Add to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart - ${(product.price * quantity).toFixed(2)}
                </>
              )}
            </motion.button>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Product Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Product Description
            </h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                {product.description}
              </p>
              <p className="text-gray-600 leading-relaxed">
                Experience the perfect blend of flavors and quality ingredients in every bite. 
                Our culinary experts have crafted this dish with care, ensuring that each element 
                complements the others to create a memorable dining experience.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailsPage;