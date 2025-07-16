import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../axiosConfig';

// shape of a basket item in your API might be:
// { id: number, productId: number, quantity: number, /* maybe product details too? */ }

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  // 1) fetch basket on mount
  useEffect(() => {
    axios.get('basket')
      .then(res => {
        setCartItems(res.data || []);
      })
      .catch(err => {
        console.error('Could not load basket:', err);
        setError('Unable to load cart.');
      })
      .finally(() => setLoading(false));
  }, []);

  // 2) add to cart
  async function addToCart(productId, quantity = 1) {
    try {
      const res = await axios.post('basket', { productId, quantity });
      // server returns the new item
      setCartItems(items => [...items, res.data]);
      return { success: true };
    } catch (err) {
      console.error('Add to cart failed:', err);
      return {
        success: false,
        message: err.response?.data?.message || err.message
      };
    }
  }

  // 3) remove from cart
  async function removeFromCart(itemId) {
    try {
      await axios.delete(`basket/${itemId}`);
      setCartItems(items => items.filter(i => i.id !== itemId));
      return { success: true };
    } catch (err) {
      console.error('Remove from cart failed:', err);
      return {
        success: false,
        message: err.response?.data?.message || err.message
      };
    }
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      error,
      addToCart,
      removeFromCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
