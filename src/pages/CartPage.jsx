import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Trash2, Plus, Minus,Loader2 } from 'lucide-react';
import theme from '../theme';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';

export default function CartPage() {
  const [items, setItems]   = useState([]); // basket rows
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await axios.get('basket');
      setItems(res.data || []);
    } catch {
      setError('Unable to load your basket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQty = async (rowId, newQty) => {
    // backend may require POST again
    try {
      await axios.post('basket', { basketItemId: rowId, quantity: newQty });
      await fetchCart();
    } catch {
      alert('Could not update quantity');
    }
  };

  const removeItem = async (rowId) => {
    try {
      await axios.delete(`basket/${rowId}`);
      await fetchCart();
    } catch {
      alert('Could not remove item');
    }
  };

  const total = items.reduce((sum, it) =>
    sum + (it.product.price * it.quantity)
  , 0);

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
        <h1 className="text-3xl font-bold mb-6" style={{ color: theme.colors.textDark }}>
          Your Basket
        </h1>

        {error && (
          <div className="mb-4 text-red-600 text-center">{error}</div>
        )}

        {items.length === 0 ? (
          <p className="text-center text-gray-600">
            Your basket is empty. <a href="/menu" className="text-orange-500 underline">Browse our menu</a>.
          </p>
        ) : (
          <>
            <div className="space-y-6">
              {items.map(it => (
                <div key={it.id} className="flex items-center bg-white rounded-lg shadow p-4">
                  <img
                    src={it.product.pictureUrl}
                    alt={it.product.name}
                    className="w-24 h-24 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold" style={{ color: theme.colors.textDark }}>
                      {it.product.name}
                    </h2>
                    <p className="text-gray-500 text-sm mb-2 line-clamp-2">
                      {it.product.description}
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <button
                          onClick={() => updateQty(it.id, it.quantity - 1)}
                          className="px-2 py-1 hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="px-4">{it.quantity}</span>
                        <button
                          onClick={() => updateQty(it.id, it.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <span className="text-lg font-bold" style={{ color: theme.colors.orange }}>
                        ${(it.product.price * it.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(it.id)}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow mt-8">
              <span className="text-xl font-semibold" style={{ color: theme.colors.textDark }}>
                Total:
              </span>
              <span className="text-2xl font-extrabold" style={{ color: theme.colors.orange }}>
                ${total.toFixed(2)}
              </span>
            </div>

            <button
              className="w-full py-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold rounded-full hover:opacity-90 transition mt-6"
              onClick={() => alert('Proceeding to checkout…')}
            >
              Checkout
            </button>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
