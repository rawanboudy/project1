// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Loader2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    axios.get('Authentication/User')
      .then(resp => {
        setUser(resp.data);
      })
      .catch(err => {
        console.error(err);
        setError(
          err.response?.data?.message
            || 'Unable to load profile. Please log in.'
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 rounded-lg">
        <div className="flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <div className="flex items-center space-x-6">
          {user.pictureUrl && (
            <img
              src={user.pictureUrl}
              alt={user.name}
              className="w-32 h-32 object-cover rounded-full"
            />
          )}
          <div>
            <h2 className="text-3xl font-bold">{user.name}</h2>
            <p className="text-gray-600 mt-1">{user.description}</p>
          </div>
        </div>
        {/* any additional profile fields */}
      </div>
    </div>
  );
}
