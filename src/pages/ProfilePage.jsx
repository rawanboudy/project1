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
  Edit,
  Copy,
  Check,
  Plus,
  X,
  Save,
  Building,
  LogOut,
  Heart
} from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/ThemeProvider';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { theme } = useTheme(); // Add theme context
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    firstname: '',
    lastname: '',
    location: '',
    city: '',
    country: ''
  });
  const [addressLoading, setAddressLoading] = useState(false);

  // Apply dark class to document root based on theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
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

    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get('/Authentication/user');
        let userData = userResponse.data;

        const userId = userData.userId;
        
        console.log('User data:', userData);
        console.log('Extracted user ID:', userId);

        if (userId) {
          try {
            const addressResponse = await axios.get(`/Authentication/address/${userId}`);
            userData.address = addressResponse.data;
          } catch (addressErr) {
            console.log('No address found or error fetching address:', addressErr);
            userData.address = null;
          }
        } else {
          console.warn('No user ID found in user data. Available properties:', Object.keys(userData));
          userData.address = null;
        }

        setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(
          err.response?.data?.message || 'Unable to load profile. Please log in.'
        );
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

  const handleAddressSubmit = async () => {
    if (!addressForm.location || !addressForm.city || !addressForm.country) {
      toast.error('Please fill in all required fields');
      return;
    }

    setAddressLoading(true);

    try {
      const userId = user.id || user.userId || user.ID || user.user_id || user.sub;
      
      console.log('User object for address update:', user);
      console.log('Extracted user ID for address update:', userId);
      
      if (!userId) {
        console.error('Available user properties:', Object.keys(user || {}));
        toast.error('User ID not found. Please refresh the page and try again.');
        return;
      }

      const response = await axios.put(`/Authentication/UpdateAddress/${userId}`, addressForm);
      const updatedUser = { ...user, address: addressForm };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));

      toast.success('Address updated successfully!');
      setShowAddressModal(false);
      setAddressForm({
        firstname: '',
        lastname: '',
        location: '',
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
    if (user.address) {
      setAddressForm({
        firstname: user.address.firstname || '',
        lastname: user.address.lastname || '',
        location: user.address.location || '',
        city: user.address.city || '',
        country: user.address.country || ''
      });
    } else {
      setAddressForm({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        location: '',
        city: '',
        country: ''
      });
    }
    setShowAddressModal(true);
  };

  const hasAddress = user?.address && (
    user.address.location ||
    user.address.city ||
    user.address.country
  );

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-md mx-auto pt-32 px-4">
          <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg p-6 shadow-sm">
            <div className="text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Profile Error</h3>
              <p className="text-gray-600 dark:text-gray-300">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-6 mt-20">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="px-6 py-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {user.firstname && user.lastname 
                        ? `${user.firstname} ${user.lastname}` 
                        : user.username || 'User Profile'
                      }
                    </h1>
                    <p className="text-orange-100">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Personal Information</h2>
                    <div className="space-y-4">
                      {user.firstname && (
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">First Name</p>
                            <p className="text-gray-900 dark:text-gray-100 font-medium">{user.firstname}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(user.firstname, 'First Name')}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {copiedField === 'First Name' ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                      
                      {user.lastname && (
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Last Name</p>
                            <p className="text-gray-900 dark:text-gray-100 font-medium">{user.lastname}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(user.lastname, 'Last Name')}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {copiedField === 'Last Name' ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                          <p className="text-gray-900 dark:text-gray-100 font-medium">{user.username}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(user.username, 'Username')}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          {copiedField === 'Username' ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                          <p className="text-gray-900 dark:text-gray-100 font-medium">{user.email}</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(user.email, 'Email')}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          {copiedField === 'Email' ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {user.phone && (
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                            <p className="text-gray-900 dark:text-gray-100 font-medium">{user.phone}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(user.phone, 'Phone')}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {copiedField === 'Phone' ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Address</h2>
                      <button
                        onClick={openAddressModal}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        {hasAddress ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {hasAddress ? 'Edit' : 'Add Address'}
                      </button>
                    </div>
                    
                    {!hasAddress ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        <p>No address information</p>
                        <p className="text-sm">Add your address to complete your profile</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {user.address.country && (
                          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <Globe className="w-4 h-4 text-orange-500" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
                                <p className="text-gray-900 dark:text-gray-100 font-medium">{user.address.country}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(user.address.country, 'Country')}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              {copiedField === 'Country' ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}

                        {user.address.city && (
                          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <Building className="w-4 h-4 text-orange-500" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">City</p>
                                <p className="text-gray-900 dark:text-gray-100 font-medium">{user.address.city}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(user.address.city, 'City')}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              {copiedField === 'City' ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}

                        {user.address.location && (
                          <div className="flex items-start justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <Home className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                              <div className="min-w-0 w-full">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                                <p className="text-gray-900 dark:text-gray-100 font-medium break-words whitespace-pre-wrap max-w-full">
                                  {user.address.location}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(user.address.location, 'Location')}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors shrink-0 ml-3"
                              aria-label="Copy location"
                            >
                              {copiedField === 'Location' ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {hasAddress ? 'Edit Address' : 'Add Address'}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    value={addressForm.firstname}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    value={addressForm.lastname}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={addressForm.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={addressForm.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location *
                </label>
                <textarea
                  name="location"
                  value={addressForm.location}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-y"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAddressModal(false)}
                disabled={addressLoading}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddressSubmit}
                disabled={addressLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {addressLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {hasAddress ? 'Update' : 'Save'} Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}