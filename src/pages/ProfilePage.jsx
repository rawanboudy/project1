import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { 
  Loader2, 
  AlertCircle, 
  User, 
  Mail, 
  MapPin, 
  Home, 
  Globe,
  Phone,
  Calendar,
  Shield,
  Edit,
  Copy,
  Check,
  Plus,
  X,
  Save
} from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    firstname: '',
    lastname: '',
    street: '',
    city: '',
    country: ''
  });
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    // First try to get user info from localStorage
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        const parsedUser = JSON.parse(storedUserInfo);
        setUser(parsedUser);
        setLoading(false);
      } catch (err) {
        console.error('Error parsing stored user info:', err);
      }
    }

    // Fetch user data and address data separately
    const fetchUserData = async () => {
      try {
        // Fetch user info
        const userResponse = await axios.get('/Authentication/user');
        let userData = userResponse.data;

        // Fetch address info separately
        try {
          const addressResponse = await axios.get('/Authentication/address');
          userData.address = addressResponse.data;
        } catch (addressErr) {
          console.log('No address found or error fetching address:', addressErr);
          userData.address = null;
        }

        setUser(userData);
        // Update stored user info
        localStorage.setItem('userInfo', JSON.stringify(userData));
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || 'Unable to load profile. Please log in.'
        );
        
        // If API call fails but we have stored data, don't show error
        if (storedUserInfo) {
          setError('');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard`);
      setTimeout(() => setCopiedField(''), 2000);
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressLoading(true);

    try {
      // Use the correct API endpoint with /api prefix
      const response = await axios.put('/Authentication/address', addressForm);
      
      // Update user state with new address
      const updatedUser = { ...user, address: addressForm };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      
      toast.success('Address updated successfully!');
      setShowAddressModal(false);
      setAddressForm({
        firstname: '',
        lastname: '',
        street: '',
        city: '',
        country: ''
      });
    } catch (err) {
      console.error('Error updating address:', err);
      toast.error(err.response?.data?.message || 'Failed to update address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openAddressModal = () => {
    // Pre-fill form with existing data if available
    if (user.address) {
      setAddressForm({
        firstname: user.address.firstname || '',
        lastname: user.address.lastname || '',
        street: user.address.street || '',
        city: user.address.city || '',
        country: user.address.country || ''
      });
    } else {
      // Pre-fill with user's basic info
      setAddressForm({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        street: '',
        city: '',
        country: ''
      });
    }
    setShowAddressModal(true);
  };

  const hasAddress = user?.address && (
    user.address.street || 
    user.address.city || 
    user.address.country
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 rounded-lg">
          <div className="flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Navbar />
      
      <div className="max-w-4xl mx-auto mt-12">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  User Profile
                </h1>
                <p className="text-orange-100">
                  Manage your account information
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-orange-500" />
                  Basic Information
                </h2>

                {/* First Name */}
                {user.firstname && (
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">First Name</p>
                      <p className="text-lg font-medium text-gray-800">{user.firstname}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(user.firstname, 'First Name')}
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      {copiedField === 'First Name' ? 
                        <Check className="w-4 h-4" /> : 
                        <Copy className="w-4 h-4" />
                      }
                    </button>
                  </div>
                )}

                {/* Last Name */}
                {user.lastname && (
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Last Name</p>
                      <p className="text-lg font-medium text-gray-800">{user.lastname}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(user.lastname, 'Last Name')}
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      {copiedField === 'Last Name' ? 
                        <Check className="w-4 h-4" /> : 
                        <Copy className="w-4 h-4" />
                      }
                    </button>
                  </div>
                )}

                {/* Username */}
                {user.username && (
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="text-lg font-medium text-gray-800">{user.username}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(user.username, 'Username')}
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      {copiedField === 'Username' ? 
                        <Check className="w-4 h-4" /> : 
                        <Copy className="w-4 h-4" />
                      }
                    </button>
                  </div>
                )}

                {/* Email */}
                {user.email && (
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Mail className="text-orange-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-lg font-medium text-gray-800">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(user.email, 'Email')}
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      {copiedField === 'Email' ? 
                        <Check className="w-4 h-4" /> : 
                        <Copy className="w-4 h-4" />
                      }
                    </button>
                  </div>
                )}
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                    Address Information
                  </h2>
                  <button
                    onClick={openAddressModal}
                    className="flex items-center px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                  >
                    {hasAddress ? (
                      <>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </>
                    )}
                  </button>
                </div>

                {!hasAddress ? (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-3">Address not set yet</p>
                    <button
                      onClick={openAddressModal}
                      className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors mx-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Set Address
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Street Address */}
                    {user.address?.street && (
                      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Home className="text-orange-500 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Street Address</p>
                            <p className="text-lg font-medium text-gray-800">{user.address.street}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(user.address.street, 'Street Address')}
                          className="text-gray-400 hover:text-orange-500 transition-colors"
                        >
                          {copiedField === 'Street Address' ? 
                            <Check className="w-4 h-4" /> : 
                            <Copy className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    )}

                    {/* City */}
                    {user.address?.city && (
                      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-500">City</p>
                          <p className="text-lg font-medium text-gray-800">{user.address.city}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(user.address.city, 'City')}
                          className="text-gray-400 hover:text-orange-500 transition-colors"
                        >
                          {copiedField === 'City' ? 
                            <Check className="w-4 h-4" /> : 
                            <Copy className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    )}

                    {/* Country */}
                    {user.address?.country && (
                      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Globe className="text-orange-500 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Country</p>
                            <p className="text-lg font-medium text-gray-800">{user.address.country}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(user.address.country, 'Country')}
                          className="text-gray-400 hover:text-orange-500 transition-colors"
                        >
                          {copiedField === 'Country' ? 
                            <Check className="w-4 h-4" /> : 
                            <Copy className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Phone Number */}
                {user.phone && (
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Phone className="text-orange-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="text-lg font-medium text-gray-800">{user.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(user.phone, 'Phone Number')}
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      {copiedField === 'Phone Number' ? 
                        <Check className="w-4 h-4" /> : 
                        <Copy className="w-4 h-4" />
                      }
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Debug Information (only show if user has additional fields) */}
            {Object.keys(user).length > 10 && (
              <div className="mt-8 bg-gray-800 text-white p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Raw User Data (Debug)</h3>
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {hasAddress ? 'Edit Address' : 'Set Address'}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstname"
                  value={addressForm.firstname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastname"
                  value={addressForm.lastname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  value={addressForm.street}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={addressForm.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={addressForm.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressLoading}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {addressLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Address
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}