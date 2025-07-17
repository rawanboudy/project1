import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Loader2, AlertCircle, User, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('Authentication/User')
      .then(resp => {
        setUser(resp.data);
      })
      .catch(err => {
        console.error(err);
        setError(
          err.response?.data?.message || 'Unable to load profile. Please log in.'
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
        <Navbar />
        <div className="flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

 return (
  <div className="min-h-screen bg-gray-50 py-12 px-4">
    <Navbar />

    <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-12">
      <h1 className="text-3xl font-bold text-center text-orange-600 mb-8">
        User Profile
      </h1>

      <div className="space-y-6">
        {/* Username */}
        <div className="flex items-center bg-gray-100 p-4 rounded-md shadow-sm">
          <User className="text-orange-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="text-lg font-medium text-gray-800">{user.username}</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center bg-gray-100 p-4 rounded-md shadow-sm">
          <Mail className="text-orange-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-medium text-gray-800">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

}
