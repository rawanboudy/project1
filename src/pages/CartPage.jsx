import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Trash2, Plus, Minus, Loader2, ShoppingCart } from 'lucide-react';
import theme from '../theme';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import { useNavigate } from 'react-router-dom';
export default function CartPage() {
  const [basketData, setBasketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState({});
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
    setUpdateLoading(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const updatedItems = basketData.items.filter(item => item.id !== itemId);
      
      const updatedBasket = {
        ...basketData,
        items: updatedItems
      };

      await axios.post('/basket', updatedBasket);
      await fetchCart();
    } catch (err) {
      setError('Could not remove item. Please try again.');
    } finally {
      setUpdateLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`/basket/${basketData.id}`);
      await fetchCart();
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto p-6 pt-32">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold" style={{ color: theme.colors.textDark }}>
            Your Basket
          </h1>
          {basketData?.items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Clear Cart
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {!basketData?.items || basketData.items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">Your basket is empty</p>
            <a 
              href="/menu" 
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold rounded-full hover:opacity-90 transition"
            >
              Browse our menu
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {basketData.items.map(item => (
                <div 
                  key={item.id} 
                  className="flex items-center bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={item.pictureUrl}
                      loading='lazy'
                      alt={item.productName}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1 ml-4">
                    <h3 className="text-lg font-semibold mb-1" style={{ color: theme.colors.textDark }}>
                      {item.productName}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3">
                      ${item.price.toFixed(2)} each
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updateLoading[item.id]}
                          className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="px-4 py-2 bg-gray-50 font-medium min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updateLoading[item.id]}
                          className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold" style={{ color: theme.colors.orange }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        {updateLoading[item.id] && (
                          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={updateLoading[item.id]}
                    className="ml-4 p-2 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: theme.colors.textDark }}>
                Order Summary
              </h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {shippingPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">${shippingPrice.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold" style={{ color: theme.colors.textDark }}>
                      Total:
                    </span>
                    <span className="text-2xl font-bold" style={{ color: theme.colors.orange }}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="w-full py-4 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold rounded-full hover:opacity-90 transition mt-6 text-lg"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}