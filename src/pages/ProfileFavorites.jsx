// src/pages/ProfileFavorites.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Heart, Trash2, Eye, Loader2, Building, User as UserIcon, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

function getFavoritesKey() {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) return null;
  try {
    const user = JSON.parse(userInfo);
    return `favorites_${user.username || user.email}`;
  } catch {
    return null;
  }
}

function readFavorites() {
  const key = getFavoritesKey();
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeFavorites(favs) {
  const key = getFavoritesKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(favs));
}

export default function ProfileFavorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFavorites(readFavorites());
    setLoading(false);

    const onStorage = (e) => {
      if (e.key && getFavoritesKey() && e.key === getFavoritesKey()) {
        setFavorites(readFavorites());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const removeOne = (productId) => {
    const updated = favorites.filter(f => f.productId !== productId);
    writeFavorites(updated);
    setFavorites(updated);
    toast.success('Removed from favorites');
  };

  const clearAll = () => {
    writeFavorites([]);
    setFavorites([]);
    toast.success('Favorites cleared');
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6 mt-16">
        <div className="flex flex-col lg:flex-row gap-6">
          
          

          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gray-900/10 to-black/10 rounded-full translate-y-12 -translate-x-12"></div>

              <div className="relative z-10">
                <div className="px-6 py-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">Your Favorites</h1>
                    {favorites.length > 0 && (
                      <button
                        onClick={clearAll}
                        className="px-3 py-1.5 text-sm bg-white/15 hover:bg-white/25 text-white rounded-lg transition"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="flex justify-center py-16">
                      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                  ) : favorites.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <Heart className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                      <p>No favorites yet</p>
                      <p className="text-sm">Browse the menu and tap the heart to save items.</p>
                      <button
                        onClick={() => navigate('/menu')}
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                      >
                        Go to Menu
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {favorites
                        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
                        .map(item => (
                          <div key={item.productId} className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition flex flex-col">
                            <div className="relative h-44">
                              <img
                                src={item.pictureUrl}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => removeOne(item.productId)}
                                className="absolute top-3 right-3 p-2 rounded-full bg-white/85 hover:bg-white shadow"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                              <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.0rem]">{item.productName}</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {(item.brandName || '')} {item.typeName ? `• ${item.typeName}` : ''}
                              </p>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-xl font-extrabold text-orange-600">
                                  ${(item.price || 0).toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {typeof item.rating === 'number' ? item.rating.toFixed(1) : '–'} ★
                                </span>
                              </div>
                              <div className="mt-auto pt-4 flex gap-2">
                                <button
                                  onClick={() => navigate(`/product/${item.productId}`)}
                                  className="w-full py-2.5 rounded-full bg-gray-700 text-white hover:bg-gray-800 transition flex items-center justify-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Product
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
