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
  Building
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

        try {
          const addressResponse = await axios.get('/Authentication/address');
          userData.address = addressResponse.data;
        } catch (addressErr) {
          console.log('No address found or error fetching address:', addressErr);
          userData.address = null;
        }

        setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
      } catch (err) {
        console.error(err);
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
    setAddressLoading(true);

    try {
      const response = await axios.put('/Authentication/address', addressForm);
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
    if (user.address) {
      setAddressForm({
        firstname: user.address.firstname || '',
        lastname: user.address.lastname || '',
        street: user.address.street || '',
        city: user.address.city || '',
        country: user.address.country || ''
      });
    } else {
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
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-16 h-16 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <Navbar />
        <div className="max-w-md mx-auto pt-32 px-4">
          <div className="bg-white border border-red-200 rounded-2xl p-8 shadow-lg">
            <div className="text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Error</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Navbar />
      <header className="w-full bg-orange-500 bg-opacity-90 backdrop-blur-md rounded-b-2xl shadow-lg mt-6">

        <div className="max-w-6xl mx-auto px-6 py-10 flex items-center gap-6">
          <div className="w-20 h-20 bg-white bg-opacity-30 rounded-full flex items-center justify-center shadow">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-wide">
              {user.firstname && user.lastname ? `${user.firstname} ${user.lastname}` : user.username || 'User Profile'}
            </h1>
            <p className="text-orange-100 text-lg">Manage your account details</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Personal Information</h2>
          <div className="space-y-4">
            {[
              { label: 'First Name', value: user.firstname },
              { label: 'Last Name', value: user.lastname },
              { label: 'Username', value: user.username },
              { label: 'Email', value: user.email },
              { label: 'Phone', value: user.phone }
            ].map((item) =>
              item.value && (
                <div
                  key={item.label}
                  className="flex justify-between items-center bg-gray-50 rounded-lg p-4 border hover:border-orange-200"
                >
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="text-lg font-medium text-gray-800">{item.value}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.value, item.label)}
                    className="p-2 rounded-full hover:bg-orange-100 transition"
                  >
                    {copiedField === item.label ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Address Information</h2>
            <button
              onClick={openAddressModal}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
            >
              {hasAddress ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {hasAddress ? 'Edit' : 'Add'}
            </button>
          </div>
          {!hasAddress ? (
            <div className="text-center text-gray-500 py-6">
              <p>No address saved.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Street', value: user.address.street, icon: Home },
                { label: 'City', value: user.address.city, icon: Building },
                { label: 'Country', value: user.address.country, icon: Globe }
              ].map(
                (item) =>
                  item.value && (
                    <div
                      key={item.label}
                      className="flex justify-between items-center bg-gray-50 rounded-lg p-4 border hover:border-orange-200"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="text-sm text-gray-500">{item.label}</p>
                          <p className="text-lg font-medium text-gray-800">{item.value}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(item.value, item.label)}
                        className="p-2 rounded-full hover:bg-orange-100 transition"
                      >
                        {copiedField === item.label ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      </main>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl">
            <div className="bg-orange-500 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{hasAddress ? 'Edit Address' : 'Add Address'}</h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="p-2 rounded-full hover:bg-orange-600 transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {['firstname', 'lastname', 'street', 'city', 'country'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 capitalize mb-1">{field}</label>
                  <input
                    type="text"
                    name={field}
                    value={addressForm[field]}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition"
                  />
                </div>
              ))}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddressSubmit}
                  disabled={addressLoading}
                  className="flex-1 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition flex justify-center items-center"
                >
                  {addressLoading ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
