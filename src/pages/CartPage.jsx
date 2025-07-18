import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Trash2, Plus, Minus, Loader2, ShoppingCart, ArrowLeft, Package, Truck } from 'lucide-react';
import theme from '../theme';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const [basketData, setBasketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState({});
  const [removingItems, setRemovingItems] = useState(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const navigate = useNavigate();

  // Get basket ID from localStorage or generate one
  const getBasketId = () => {
    let basketId = localStorage.getItem('basketId');
    if (!basketId) {
      basketId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem('basketId', basketId);
    }
    return basketId;
  };

  const fetchCart = async () => {
    setLoading(true);
    setError('');
    try {
      const basketId = getBasketId();
      const res = await axios.get(`/basket/${basketId}`);
      setBasketData(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        // Basket not found, create empty basket
        setBasketData({
          id: getBasketId(),
          items: [],
          paymentIntentId: "",
          deliveryMethodId: 0,
          clientSecret: "",
          shippingPrice: 0
        });
      } else {
        setError('Unable to load your basket.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeItem(itemId);
      return;
    }

    setUpdateLoading(prev => ({ ...prev, [itemId]: true }));
    
    try {
      // Create updated basket data
      const updatedItems = basketData.items.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );

      const updatedBasket = {
        ...basketData,
        items: updatedItems
      };

      await axios.post('/basket', updatedBasket);
      await fetchCart();
    } catch (err) {
      setError('Could not update quantity. Please try again.');
    } finally {
      setUpdateLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    setRemovingItems(prev => new Set(prev).add(itemId));
    setUpdateLoading(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const updatedItems = basketData.items.filter(item => item.id !== itemId);
      
      const updatedBasket = {
        ...basketData,
        items: updatedItems
      };

      await axios.post('/basket', updatedBasket);
      
      // Add delay for smooth animation
      setTimeout(async () => {
        await fetchCart();
        setRemovingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 300);
    } catch (err) {
      setError('Could not remove item. Please try again.');
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    } finally {
      setUpdateLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`/basket/${basketData.id}`);
      await fetchCart();
      setShowClearConfirm(false);
    } catch (err) {
      setError('Could not clear cart. Please try again.');
    }
  };

  // Calculate totals
  const subtotal = basketData?.items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0) || 0;
  const shippingPrice = basketData?.shippingPrice || 0;
  const total = subtotal + shippingPrice;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="text-center animate-pulse">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4 relative z-10" />
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading your basket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <Navbar />
      
     {/* Enhanced Professional Header Section */}
<div className="bg-white/80 backdrop-blur-xl border-b border-orange-100 shadow-sm sticky top-0 z-40 mt-20">
  <div className="max-w-6xl mx-auto px-6 py-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 7.5M17 13l1.5 7.5M9 21h6" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {basketData?.items?.length || 0} {basketData?.items?.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
      </div>

      {/* Right side */}
      {basketData?.items?.length > 0 && (
        <button
          onClick={() => setShowClearConfirm(true)}
          className="px-6 py-3 text-red-500 hover:text-white bg-transparent hover:bg-red-500 border border-red-300 hover:border-red-600 rounded-xl font-medium transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          Clear Cart
        </button>
      )}
    </div>
  </div>
</div>

      <main className="max-w-6xl mx-auto p-6 pt-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl shadow-lg animate-in slide-in-from-top duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <p className="ml-3 text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl transform animate-in zoom-in duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Clear Your Cart?</h3>
                <p className="text-gray-600 mb-6">This action will remove all items from your cart. This cannot be undone.</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clearCart}
                    className="flex-1 py-3 px-6 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors duration-200 font-medium"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty Cart State */}
        {!basketData?.items || basketData.items.length === 0 ? (
          <div className="text-center py-20 animate-in fade-in duration-500">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white rounded-full p-8 shadow-2xl w-32 h-32 mx-auto flex items-center justify-center">
                <ShoppingCart className="w-16 h-16 text-orange-500" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
            </p>
            <button 
              onClick={() => navigate('/menu')}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl hover:from-orange-500 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
            >
              <Package className="w-5 h-5 mr-2" />
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Column */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {basketData.items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-orange-100 ${
                      removingItems.has(item.id) ? 'animate-out slide-out-to-right duration-300 opacity-0' : 'animate-in slide-in-from-left duration-500'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative flex items-center p-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-300 scale-110"></div>
                        <div className="relative">
                          <img
                            src={item.pictureUrl}
                            alt={item.productName}
                            className="w-28 h-28 object-cover rounded-2xl shadow-xl ring-4 ring-white"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                        </div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 ml-6">
                        <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                          {item.productName}
                        </h3>
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="text-2xl font-bold text-orange-500">
                            ${item.price.toFixed(2)}
                          </span>
                          <span className="text-gray-500 text-sm">per item</span>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-gray-50 rounded-2xl overflow-hidden shadow-inner border border-gray-200">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updateLoading[item.id]}
                              className="px-4 py-3 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group/btn"
                            >
                              <Minus className="w-5 h-5 text-gray-600 group-hover/btn:text-orange-600 transition-colors duration-200" />
                            </button>
                            <div className="px-6 py-3 bg-white font-bold text-lg min-w-[4rem] text-center border-x border-gray-200">
                              {item.quantity}
                            </div>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updateLoading[item.id]}
                              className="px-4 py-3 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group/btn"
                            >
                              <Plus className="w-5 h-5 text-gray-600 group-hover/btn:text-orange-600 transition-colors duration-200" />
                            </button>
                          </div>
                          
                          {/* Item Total */}
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            {updateLoading[item.id] && (
                              <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updateLoading[item.id]}
                        className="ml-4 p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110 group/remove"
                      >
                        <Trash2 className="w-6 h-6 group-hover/remove:scale-110 transition-transform duration-200" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl p-8 border border-orange-100 animate-in slide-in-from-right duration-500">
                  <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent flex items-center">
                    <Package className="w-6 h-6 mr-2 text-orange-500" />
                    Order Summary
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center py-3 border-b border-orange-100">
                      <span className="text-gray-700 font-medium">Subtotal:</span>
                      <span className="font-bold text-xl text-gray-800">${subtotal.toFixed(2)}</span>
                    </div>
                    {shippingPrice > 0 && (
                      <div className="flex justify-between items-center py-3 border-b border-orange-100">
                        <span className="text-gray-700 font-medium flex items-center">
                          <Truck className="w-4 h-4 mr-2" />
                          Shipping:
                        </span>
                        <span className="font-bold text-xl text-gray-800">${shippingPrice.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl px-4 border-2 border-orange-200">
                      <span className="text-xl font-bold text-gray-800">
                        Total:
                      </span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button 
                    onClick={() => navigate('/checkout')}
                    className="group relative w-full py-4 text-xl font-bold text-white bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl hover:from-orange-500 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 mr-2" />
                      Proceed to Checkout
                      <div className="ml-2 transform group-hover:translate-x-1 transition-transform duration-200">
                        →
                      </div>
                    </span>
                  </button>

                 
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}