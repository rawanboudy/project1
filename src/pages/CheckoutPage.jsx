// src/components/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, Phone, Home, Building, Clock, CreditCard, ArrowLeft, Check } from 'lucide-react';
import theme from '../theme';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Location, 2: Order Summary, 3: Payment
  const [loading, setLoading] = useState(false);
  
  // Location form state
  const [locationData, setLocationData] = useState({
    firstname: '',
    lastname: '',
    street: '',
    city: '',
    country: '',
    phone: '',
    addressType: 'home', // home, work, other
    deliveryInstructions: ''
  });

  const [errors, setErrors] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  // Load cart data
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartItems(cart);
      
      // Calculate total
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setCartTotal(total);
    }
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocationData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!locationData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    }
    
    if (!locationData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    }
    
    if (!locationData.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    
    if (!locationData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!locationData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    if (!locationData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(locationData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    
    try {
      // Here you would typically save the address to your API
      // For now, we'll save to localStorage and simulate API call
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save location data
      localStorage.setItem('deliveryAddress', JSON.stringify(locationData));
      
      toast.success('Delivery address saved successfully!');
      setStep(2); // Move to order summary
      
    } catch (error) {
      toast.error('Failed to save address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Address type options
  const addressTypes = [
    { value: 'home', label: 'Home', icon: Home },
    { value: 'work', label: 'Work', icon: Building },
    { value: 'other', label: 'Other', icon: MapPin }
  ];

  // Countries list (you can expand this)
  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
    'Italy', 'Spain', 'Australia', 'Japan', 'Egypt', 'Other'
  ];

  const renderLocationForm = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})`
            }}
          >
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: theme.colors.textDark }}>
              Delivery Address
            </h2>
            <p className="text-gray-600">Where should we deliver your order?</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstname"
                value={locationData.firstname}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                  errors.firstname ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your first name"
              />
              {errors.firstname && (
                <p className="text-red-500 text-sm mt-1">{errors.firstname}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastname"
                value={locationData.lastname}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                  errors.lastname ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your last name"
              />
              {errors.lastname && (
                <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>
              )}
            </div>
          </div>

          {/* Address Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              name="street"
              value={locationData.street}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                errors.street ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your street address"
            />
            {errors.street && (
              <p className="text-red-500 text-sm mt-1">{errors.street}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={locationData.city}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your city"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <select
                name="country"
                value={locationData.country}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                  errors.country ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select country</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              {errors.country && (
                <p className="text-red-500 text-sm mt-1">{errors.country}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={locationData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your phone number"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Address Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {addressTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLocationData(prev => ({ ...prev, addressType: value }))}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    locationData.addressType === value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${
                    locationData.addressType === value ? 'text-orange-500' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    locationData.addressType === value ? 'text-orange-500' : 'text-gray-600'
                  }`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Instructions (Optional)
            </label>
            <textarea
              name="deliveryInstructions"
              value={locationData.deliveryInstructions}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              placeholder="Any special instructions for delivery..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  Continue to Order Summary
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6" style={{ color: theme.colors.textDark }}>
          Order Summary
        </h2>
        
        {/* Delivery Address */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-semibold mb-2">Delivery Address</h3>
          <p className="text-gray-600">
            {locationData.firstname} {locationData.lastname}<br />
            {locationData.street}<br />
            {locationData.city}, {locationData.country}<br />
            {locationData.phone}
          </p>
        </div>

        {/* Order Items */}
        <div className="space-y-4 mb-6">
          {cartItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-4 border rounded-xl">
              <div>
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total: ${cartTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setStep(1)}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
          >
            Back to Address
          </button>
          
          <button
            onClick={() => setStep(3)}
            className="flex-1 py-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6" style={{ color: theme.colors.textDark }}>
          Payment
        </h2>
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-6">Payment integration would go here</p>
          <button
            onClick={() => {
              toast.success('Order placed successfully!');
              navigate('/');
            }}
            className="px-8 py-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
          >
            Complete Order
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= stepNum
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {stepNum}
                </div>
                <span className={`ml-2 font-medium ${
                  step >= stepNum ? 'text-orange-500' : 'text-gray-500'
                }`}>
                  {stepNum === 1 && 'Address'}
                  {stepNum === 2 && 'Summary'}
                  {stepNum === 3 && 'Payment'}
                </span>
                {stepNum < 3 && (
                  <div className={`w-24 h-1 mx-4 ${
                    step > stepNum ? 'bg-orange-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && renderLocationForm()}
        {step === 2 && renderOrderSummary()}
        {step === 3 && renderPayment()}
      </div>
    </div>
  );
};

export default CheckoutPage;