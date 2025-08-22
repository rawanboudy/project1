import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, Phone, Home, Building, Clock, CreditCard, ArrowLeft, Check, Truck, AlertCircle, Star, Shield, Package } from 'lucide-react';
import axios from '../axiosConfig';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Location, 2: Delivery Method, 3: Order Summary
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState(null); // Added for user ID
  
  // Location form state
  const [locationData, setLocationData] = useState({
    firstname: '',
    lastname: '',
    street: '',
    city: '',
    country: '',
    phone: '',
    addressType: 'home',
    deliveryInstructions: ''
  });

  // API validation errors only
  const [apiErrors, setApiErrors] = useState({});
  const [basketData, setBasketData] = useState(null);
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  // Get basket ID from localStorage (same as CartPage)
  const getBasketId = () => {
    let basketId = localStorage.getItem('basketId');
    if (!basketId) {
      basketId = `basket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('basketId', basketId);
    }
    return basketId;
  };

  // Load basket data and user info
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserEmail(user.email || '');
      
      // Load user data from API
      loadUserData();
    }

    // Load basket data
    loadBasketData();

    // Fetch delivery methods
    fetchDeliveryMethods();
  }, []);

  // Load basket data from API
  const loadBasketData = async () => {
    try {
      const basketId = getBasketId();
      const response = await axios.get(`/basket/${basketId}`);
      
      if (response.data && response.data.items && response.data.items.length > 0) {
        setBasketData(response.data);
      } else {
        // No items in basket, redirect to cart
        toast.error('Your cart is empty. Please add items before checkout.');
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error loading basket:', error);
      if (error.response?.status === 404) {
        toast.error('Your cart is empty. Please add items before checkout.');
        navigate('/cart');
      } else {
        toast.error('Failed to load cart data. Please try again.');
      }
    }
  };

  // UPDATED: Load user data from API with user ID handling
  const loadUserData = async () => {
  try {
    // Get user info
    const userResponse = await axios.get('/Authentication/user');
    const userData = userResponse.data;
    
    // Store the user ID for later use - handle different possible field names
    const userIdValue = userData.userId || userData.id || userData.UserId;
    setUserId(userIdValue);
    
    console.log('User data loaded:', userData);
    console.log('User ID extracted:', userIdValue);
    
    // Get user address using the user ID
    try {
      const addressResponse = await axios.get(`/Authentication/address/${userIdValue}`);
      const addressData = addressResponse.data;
      
      console.log('Address data loaded:', addressData);
      
      setLocationData(prev => ({
        ...prev,
        firstname: addressData.firstname || userData.firstname || '',
        lastname: addressData.lastname || userData.lastname || '',
        street: addressData.location || addressData.street || '', // Handle API's 'location' field
        city: addressData.city || '',
        country: addressData.country || '',
        phone: userData.phone || ''
      }));
    } catch (addressError) {
      console.log('No existing address found, using user data only:', addressError);
      // If no address found, just use user data
      setLocationData(prev => ({
        ...prev,
        firstname: userData.firstname || '',
        lastname: userData.lastname || '',
        phone: userData.phone || ''
      }));
    }
    
  } catch (error) {
    console.error('Error loading user data:', error);
  }
};

  // Update basket with delivery method
  const updateBasketWithDelivery = async (deliveryMethodId) => {
    try {
      if (!basketData) {
        throw new Error('No basket data available');
      }

      if (!deliveryMethodId) {
        throw new Error('No delivery method ID provided');
      }

      // Ensure deliveryMethodId is a number
      const numericDeliveryMethodId = parseInt(deliveryMethodId);
      if (isNaN(numericDeliveryMethodId)) {
        throw new Error('Invalid delivery method ID format');
      }

      // Find the selected delivery method to get the cost
      const deliveryMethod = deliveryMethods.find(method => method.id === numericDeliveryMethodId);
      if (!deliveryMethod) {
        throw new Error('Selected delivery method not found');
      }

      const updatedBasket = {
        id: basketData.id,
        items: basketData.items,
        clientSecret: basketData.clientSecret || null,
        paymentIntentId: basketData.paymentIntentId || null,
        deliveryMethodId: numericDeliveryMethodId,
        shippingPrice: deliveryMethod.cost || 0
      };

      console.log('Updating basket with delivery method:');
      console.log('- Basket ID:', basketData.id);
      console.log('- Delivery Method ID:', numericDeliveryMethodId);
      console.log('- Shipping Price:', deliveryMethod.cost || 0);

      const response = await axios.post('/basket', updatedBasket, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      
      console.log('Basket updated successfully:', response.data);
      setBasketData(response.data);
      return response.data;
      
    } catch (error) {
      console.error('Error updating basket with delivery method:', error);
      
      if (error.response) {
        console.error('Update basket error status:', error.response.status);
        console.error('Update basket error data:', error.response.data);
      }
      
      throw new Error(`Failed to update basket: ${error.message}`);
    }
  };

  // Fetch delivery methods from API
  const fetchDeliveryMethods = async () => {
    try {
      const response = await axios.get('/orders/deliveryMethods');
      setDeliveryMethods(response.data);
    } catch (error) {
      console.error('Error fetching delivery methods:', error);
      toast.error('Failed to load delivery methods');
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocationData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear API error when user starts typing
    if (apiErrors[name]) {
      setApiErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Parse API validation errors
const parseApiErrors = (error) => {
  const errors = {};
  
  if (error.response?.data) {
    const errorData = error.response.data;
    
    console.log('Parsing API error data:', errorData);
    
    // Handle different API error response formats
    if (errorData.errors && typeof errorData.errors === 'object') {
      // ASP.NET Core validation errors format
      Object.keys(errorData.errors).forEach(field => {
        const fieldName = field.toLowerCase();
        if (Array.isArray(errorData.errors[field])) {
          errors[fieldName] = errorData.errors[field][0];
        } else {
          errors[fieldName] = errorData.errors[field];
        }
      });
    } else if (errorData.title || errorData.detail) {
      // Problem Details format
      errors.general = errorData.detail || errorData.title;
    } else if (errorData.errorMessage) {
      // Custom error format
      errors.general = errorData.errorMessage;
    } else if (errorData.message) {
      // Simple message format
      errors.general = errorData.message;
    } else if (typeof errorData === 'string') {
      errors.general = errorData;
    } else {
      // Fallback for unknown error format
      errors.general = 'An error occurred while saving your address.';
    }
  } else {
    // Network or other error
    errors.general = 'Network error. Please check your connection and try again.';
  }
  
  return errors;
};

  // Client-side validation for required fields
  const validateAddressData = () => {
    const errors = {};
    
    if (!locationData.firstname?.trim()) {
      errors.firstname = 'First name is required';
    }
    
    if (!locationData.lastname?.trim()) {
      errors.lastname = 'Last name is required';
    }
    
    if (!locationData.street?.trim()) {
      errors.street = 'Street address is required';
    }
    
    if (!locationData.city?.trim()) {
      errors.city = 'City is required';
    }
    
    if (!locationData.country?.trim()) {
      errors.country = 'Country is required';
    }
    
    return errors;
  };

  // UPDATED: Handle address form submission with user ID in URL
  const handleAddressSubmit = async (e) => {
  if (e) {
    e.preventDefault();
  }
  
  // Clear previous errors
  setApiErrors({});
  
  // Client-side validation first
  const validationErrors = validateAddressData();
  if (Object.keys(validationErrors).length > 0) {
    setApiErrors(validationErrors);
    const firstError = Object.values(validationErrors)[0];
    toast.error(`Please fix: ${firstError}`);
    return;
  }

  if (!userId) {
    toast.error('User information not loaded. Please refresh the page.');
    return;
  }
  
  setLoading(true);
  
  try {
    console.log('Submitting address data for user:', userId);
    
    // FIXED: Use the correct API endpoint from your documentation
    const addressData = {
      firstname: locationData.firstname.trim(),
      lastname: locationData.lastname.trim(),
      location: locationData.street.trim(), // API expects 'location' field
      city: locationData.city.trim(),
      country: locationData.country.trim()
    };
    
    console.log('Address data being sent:', addressData);
    
    // Use the correct endpoint: PUT /api/Authentication/UpdateAddress/{id}
    const response = await axios.put(`/Authentication/UpdateAddress/${userId}`, addressData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 seconds timeout
    });
    
    console.log('Address saved successfully:', response.data);
    
    localStorage.setItem('deliveryAddress', JSON.stringify(locationData));
    toast.success('Delivery address saved successfully!');
    setStep(2); // Move to delivery method selection
    
  } catch (error) {
    console.error('Error saving address:', error);
    console.error('Error response:', error.response);
    
    // Parse and set API validation errors
    const parsedErrors = parseApiErrors(error);
    setApiErrors(parsedErrors);
    
    // Handle specific error cases
    if (error.response?.status === 400) {
      // Bad Request - validation errors
      if (parsedErrors.general) {
        toast.error(parsedErrors.general);
      } else {
        const firstError = Object.values(parsedErrors)[0];
        if (firstError) {
          toast.error(`Validation error: ${firstError}`);
        } else {
          toast.error('Please check your input and try again.');
        }
      }
    } else if (error.response?.status === 401) {
      toast.error('Please log in to save your address.');
    } else if (error.response?.status === 404) {
      toast.error('User not found. Please log in again.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection and try again.');
    } else {
      toast.error('Failed to save address. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  // FIXED: Mobile button handler for address submission
  const handleMobileAddressSubmit = () => {
    handleAddressSubmit();
  };

  // UPDATED: Handle final order submission with user ID in URL
  const handleOrderSubmit = async () => {
    if (!selectedDeliveryMethod) {
      toast.error('Please select a delivery method');
      return;
    }

    if (!basketData || !basketData.items || basketData.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!userId) {
      toast.error('User information not loaded. Please refresh the page.');
      return;
    }

    // Validate address data before submitting
    const validationErrors = validateAddressData();
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please complete your address information');
      setStep(1);
      return;
    }

    setSubmitting(true);
    setApiErrors({});
    
    try {
      // Step 1: Update basket with selected delivery method first
      console.log('Step 1: Updating basket with delivery method:', selectedDeliveryMethod.id);
      const updatedBasket = await updateBasketWithDelivery(selectedDeliveryMethod.id);
      console.log('Basket updated successfully:', updatedBasket);
      
      // Step 2: Create order using user ID in URL path
      const orderData = {
        basketId: basketData.id,
        shipToAddress: {
          firstname: locationData.firstname.trim(),
          lastname: locationData.lastname.trim(),
          location: locationData.street.trim(), // Use 'location' as per API schema
          city: locationData.city.trim(),
          country: locationData.country.trim()
        },
        deliveryMethodId: selectedDeliveryMethod.id
      };

      console.log('Step 2: Creating order with user ID:', userId);
      console.log('Order data:', JSON.stringify(orderData, null, 2));
      console.log('Current basket data:', JSON.stringify(basketData, null, 2));
      console.log('Selected delivery method:', JSON.stringify(selectedDeliveryMethod, null, 2));
      console.log('Location data:', JSON.stringify(locationData, null, 2));

      // UPDATED: Use POST with user ID in URL path: /api/orders/{id}
      const response = await axios.post(`/orders/${userId}`, orderData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.data) {
        console.log('Order created successfully:', response.data);
        
        // Clear basket and redirect to success page
        localStorage.removeItem('basketId');
        toast.success('Order placed successfully!');
        navigate('/order-success', { 
          state: { 
            orderId: response.data.id,
            orderDetails: response.data 
          }
        });
      }
      
    } catch (error) {
      console.error('Error creating order:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        console.error('Error response data:', error.response.data);
        
        // Try to log the full error structure
        try {
          console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
        } catch (e) {
          console.error('Could not stringify error response');
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      // Parse API validation errors
      const parsedErrors = parseApiErrors(error);
      setApiErrors(parsedErrors);
      
      // Handle different error types
      if (error.response?.status === 400) {
        // Show validation errors from API
        if (parsedErrors.general) {
          toast.error(`Order failed: ${parsedErrors.general}`);
        } else {
          const firstError = Object.values(parsedErrors)[0];
          if (firstError) {
            toast.error(`Validation error: ${firstError}`);
          } else {
            toast.error('Order failed: Please check your information and try again.');
          }
        }
      } else if (error.response?.status === 401) {
        toast.error('Please log in to place an order');
        navigate('/login');
      } else if (error.response?.status === 404) {
        toast.error('User or basket not found. Please refresh and try again.');
        navigate('/cart');
      } else if (error.response?.status === 500) {
        // Handle the specific 500 error you're getting
        const errorMessage = error.response?.data?.errorMessage || 'Server error occurred';
        toast.error(`Server error: ${errorMessage}. Please try again or contact support.`);
        
        // Additional debugging for 500 errors
        console.error('500 Error Details:');
        console.error('User ID being sent:', userId);
        console.error('Basket ID being sent:', basketData.id);
        console.error('Delivery Method ID being sent:', selectedDeliveryMethod.id);
        console.error('Address data being sent:', locationData);
        
        // Check if required data is valid
        if (!userId) {
          console.error('ISSUE: User ID is missing or invalid');
          toast.error('Invalid user session. Please log in again.');
          navigate('/login');
          return;
        }
        
        if (!basketData.id) {
          console.error('ISSUE: Basket ID is missing or invalid');
          toast.error('Invalid basket. Please refresh and try again.');
          navigate('/cart');
          return;
        }
        
        if (!selectedDeliveryMethod.id) {
          console.error('ISSUE: Delivery Method ID is missing or invalid');
          toast.error('Invalid delivery method. Please select again.');
          setStep(2);
          return;
        }
        
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check your connection and try again.');
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Countries list
  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
    'Italy', 'Spain', 'Australia', 'Japan', 'Egypt', 'Other'
  ];

  // Calculate totals from basket data
  const subtotal = basketData?.items?.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0) || 0;
  const shippingPrice = selectedDeliveryMethod?.cost || basketData?.shippingPrice || 0;
  const total = subtotal + shippingPrice;

  // Shared Order Summary Component
  const OrderSummaryCard = ({ title, showButtons = false, stepNumber = null }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
      <h3 className="text-lg font-bold text-black mb-4">{title}</h3>
      
      {/* Quick Items Preview - Only show first few items */}
      <div className="space-y-3 mb-4">
        {basketData?.items?.slice(0, 2).map((item, index) => (
          <div key={index} className="flex gap-3 items-center">
            <img 
              src={item.pictureUrl} 
              alt={item.productName}
              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-black truncate">{item.productName}</p>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
            <p className="font-semibold text-black text-sm">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
        
        {basketData?.items?.length > 2 && (
          <p className="text-sm text-gray-500 text-center">+{basketData.items.length - 2} more items</p>
        )}
      </div>

      {/* Selected Delivery Method */}
      {selectedDeliveryMethod && stepNumber >= 2 && (
        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span className="font-semibold text-orange-900 text-sm">{selectedDeliveryMethod.shortName}</span>
          </div>
          <p className="text-xs text-orange-700">{selectedDeliveryMethod.deliveryTime}</p>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>
        {(selectedDeliveryMethod || shippingPrice > 0) && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery:</span>
            <span className="font-semibold">
              {shippingPrice === 0 ? 'Free' : `$${shippingPrice.toFixed(2)}`}
            </span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold text-black pt-2 border-t">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Security Badge */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-black">
          <Shield className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Secure Checkout</span>
        </div>
        <p className="text-xs text-gray-600 mt-1">Your information is protected</p>
      </div>

      {/* Action Buttons for Mobile */}
      {showButtons && (
        <div className="mt-6 space-y-3">
          {stepNumber === 1 && (
            <>
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="w-full py-3 px-4 border-2 border-black text-black rounded-xl hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-2 font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Cart
              </button>
              
              <button
                type="button"
                onClick={handleMobileAddressSubmit}
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}

          {stepNumber === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                className="w-full py-3 px-4 border-2 border-black text-black rounded-xl hover:bg-black hover:text-white transition-all duration-300 font-medium text-sm"
              >
                Back to Address
              </button>
              
              <button
                onClick={() => setStep(3)}
                disabled={!selectedDeliveryMethod}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all duration-300 shadow-lg text-sm"
              >
                Continue to Summary
              </button>
            </>
          )}

          {stepNumber === 3 && (
            <>
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 px-4 border-2 border-black text-black rounded-xl hover:bg-black hover:text-white transition-all duration-300 font-medium text-sm"
              >
                Back to Delivery
              </button>
              
              <button
                onClick={handleOrderSubmit}
                disabled={submitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Place Order
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  const renderLocationForm = () => (
    <div className="space-y-4">
      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-full -translate-y-10 translate-x-10 sm:-translate-y-12 sm:translate-x-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-black">Delivery Address</h2>
              <p className="text-sm text-gray-600">Where should we deliver your order?</p>
            </div>
          </div>

          {/* Show general API error */}
          {apiErrors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">{apiErrors.general}</span>
              </div>
            </div>
          )}

          <form id="address-form" onSubmit={handleAddressSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-black mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="firstname"
                    value={locationData.firstname}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md text-sm ${
                      apiErrors.firstname 
                        ? 'border-red-400 focus:border-red-500' 
                        : 'border-gray-200 focus:border-orange-500 group-hover:border-orange-300'
                    }`}
                    placeholder="Enter your first name"
                  />
                  {apiErrors.firstname && (
                    <div className="absolute -bottom-6 left-0 text-red-500 text-xs font-medium">
                      {apiErrors.firstname}
                    </div>
                  )}
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-black mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastname"
                    value={locationData.lastname}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md text-sm ${
                      apiErrors.lastname 
                        ? 'border-red-400 focus:border-red-500' 
                        : 'border-gray-200 focus:border-orange-500 group-hover:border-orange-300'
                    }`}
                    placeholder="Enter your last name"
                  />
                  {apiErrors.lastname && (
                    <div className="absolute -bottom-6 left-0 text-red-500 text-xs font-medium">
                      {apiErrors.lastname}
                    </div>
                  )}
                </div>
              </div>
            </div>
               {/* Phone */}
            <div className="group">
              <label className="block text-sm font-semibold text-black mb-2">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={locationData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md text-sm ${
                    apiErrors.phone 
                      ? 'border-red-400 focus:border-red-500' 
                      : 'border-gray-200 focus:border-orange-500 group-hover:border-orange-300'
                  }`}
                  placeholder="Enter your phone number"
                />
                {apiErrors.phone && (
                  <div className="absolute -bottom-6 left-0 text-red-500 text-xs font-medium">
                    {apiErrors.phone}
                  </div>
                )}
              </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-sm font-semibold text-black mb-2">
                  City *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="city"
                    value={locationData.city}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md text-sm ${
                      apiErrors.city 
                        ? 'border-red-400 focus:border-red-500' 
                        : 'border-gray-200 focus:border-orange-500 group-hover:border-orange-300'
                    }`}
                    placeholder="Enter your city"
                  />
                  {apiErrors.city && (
                    <div className="absolute -bottom-6 left-0 text-red-500 text-xs font-medium">
                      {apiErrors.city}
                    </div>
                  )}
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-black mb-2">
                  Country *
                </label>
                <div className="relative">
                  <select
                    name="country"
                    value={locationData.country}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md text-sm ${
                      apiErrors.country 
                        ? 'border-red-400 focus:border-red-500' 
                        : 'border-gray-200 focus:border-orange-500 group-hover:border-orange-300'
                    }`}
                  >
                    <option value="">Select country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {apiErrors.country && (
                    <div className="absolute -bottom-6 left-0 text-red-500 text-xs font-medium">
                      {apiErrors.country}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Address Fields */}
            <div className="group">
              <label className="block text-sm font-semibold text-black mb-2">
                Location *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="street"
                  value={locationData.street}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md text-sm ${
                    apiErrors.street 
                      ? 'border-red-400 focus:border-red-500' 
                      : 'border-gray-200 focus:border-orange-500 group-hover:border-orange-300'
                  }`}
                  placeholder="Enter your street address"
                />
                {apiErrors.street && (
                  <div className="absolute -bottom-6 left-0 text-red-500 text-xs font-medium">
                    {apiErrors.street}
                  </div>
                )}
              </div>
            </div>

            

         

            {/* Delivery Instructions */}
            <div className="group">
              <label className="block text-sm font-semibold text-black mb-2">
                Delivery Instructions (Optional)
              </label>
              <textarea
                name="deliveryInstructions"
                value={locationData.deliveryInstructions}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:bg-white focus:border-orange-500 focus:shadow-md group-hover:border-orange-300 text-sm"
                placeholder="Any special instructions for delivery..."
              />
            </div>

            {/* Desktop Buttons */}
            <div className="hidden lg:flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="flex-1 py-3 px-6 border-2 border-black text-black rounded-xl hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-2 font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Cart
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Order Summary with Buttons */}
      <div className="lg:hidden">
        <OrderSummaryCard title="Order Summary" showButtons={true} stepNumber={1} />
      </div>
    </div>
  );

  const renderDeliveryMethods = () => (
    <div className="space-y-4">
      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-full -translate-y-12 translate-x-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-black">Delivery Method</h2>
              <p className="text-sm text-gray-600">Choose your preferred delivery option</p>
            </div>
          </div>

          <div className="space-y-3">
            {deliveryMethods.map((method) => (
              <div
                key={method.id}
                className={`relative p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                  selectedDeliveryMethod?.id === method.id
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-gray-200 hover:border-orange-300 bg-white'
                }`}
                onClick={() => setSelectedDeliveryMethod(method)}
              >
                {selectedDeliveryMethod?.id === method.id && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1 w-full sm:w-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      <h3 className="font-bold text-black text-sm sm:text-base">{method.shortName}</h3>
                    </div>
                    <p className="text-gray-600 mb-2 text-sm">{method.description}</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <p className="text-xs text-gray-500">{method.deliveryTime}</p>
                    </div>
                  </div>
                  <div className="text-right w-full sm:w-auto flex sm:block justify-between items-center">
                    <p className="text-lg sm:text-xl font-bold text-black">
                      {method.cost === 0 ? 'Free' : `${method.cost.toFixed(2)}`}
                    </p>
                    {method.cost === 0 && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full mt-0 sm:mt-1">
                        <Star className="w-3 h-3" />
                        Popular
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {deliveryMethods.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 text-base">No delivery methods available</p>
            </div>
          )}

          {/* Desktop Buttons */}
          <div className="hidden lg:flex gap-4 pt-6">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 px-6 border-2 border-black text-black rounded-xl hover:bg-black hover:text-white transition-all duration-300 font-medium text-sm"
            >
              Back to Address
            </button>
            
            <button
              onClick={() => setStep(3)}
              disabled={!selectedDeliveryMethod}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all duration-300 shadow-lg text-sm"
            >
              Continue to Summary
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Order Summary with Buttons */}
      <div className="lg:hidden">
        <OrderSummaryCard title="Delivery Summary" showButtons={true} stepNumber={2} />
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <div className="space-y-4">
      {/* Order Details */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-full -translate-y-10 translate-x-10"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-black">Order Summary</h2>
              <p className="text-sm text-gray-600">Review your order before placing it</p>
            </div>
          </div>

          {/* Show order-level API errors */}
          {apiErrors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">{apiErrors.general}</span>
              </div>
            </div>
          )}

          {/* Delivery Address */}
          <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="font-bold mb-3 text-black flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
              Delivery Address
            </h3>
            <div className="text-gray-700 leading-relaxed text-sm">
              <p className="font-semibold">{locationData.firstname} {locationData.lastname}</p>
              <p>{locationData.street}</p>
              <p>{locationData.city}, {locationData.country}</p>
              {locationData.phone && (
                <div className="flex items-center gap-2 mt-2">
                  <Phone className="w-3 h-3 text-gray-500 flex-shrink-0" />
                  <p>{locationData.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Method */}
          {selectedDeliveryMethod && (
            <div className="mb-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
              <h3 className="font-bold mb-3 text-black flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-orange-600 flex-shrink-0" />
                Delivery Method
              </h3>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-black text-sm">{selectedDeliveryMethod.shortName}</p>
                  <p className="text-xs text-gray-600">{selectedDeliveryMethod.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    <p className="text-xs text-gray-500">{selectedDeliveryMethod.deliveryTime}</p>
                  </div>
                </div>
                <div className="text-right w-full sm:w-auto flex sm:block justify-between items-center">
                  <p className="text-lg font-bold text-black">
                    {selectedDeliveryMethod.cost === 0 ? 'Free' : `${selectedDeliveryMethod.cost.toFixed(2)}`}
                  </p>
                  {selectedDeliveryMethod.cost === 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full mt-0 sm:mt-1">
                      <Star className="w-3 h-3" />
                      Great Deal!
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="font-bold text-black flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-gray-600 flex-shrink-0" />
              Order Items ({basketData?.items?.length || 0})
            </h3>
            {basketData?.items?.map((item, index) => (
              <div key={index} className="flex gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow duration-300">
                <img 
                  src={item.pictureUrl} 
                  alt={item.productName}
                  className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-black text-sm truncate">{item.productName}</h4>
                  <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-xs text-gray-500">${item.price} each</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-black">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex gap-4 pt-6">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 px-6 border-2 border-black text-black rounded-xl hover:bg-black hover:text-white transition-all duration-300 font-medium text-sm"
            >
              Back to Delivery
            </button>
            
            <button
              onClick={handleOrderSubmit}
              disabled={submitting}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Placing Order...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Place Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Final Summary with Buttons */}
      <div className="lg:hidden">
        <OrderSummaryCard title="Final Summary" showButtons={true} stepNumber={3} />
      </div>
    </div>
  );

  // Loading state while basket data is being fetched
  if (!basketData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="bg-gray-50 rounded-xl p-6 shadow-lg max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-black mb-2">Loading checkout...</h3>
            <p className="text-sm text-gray-600">Preparing your order details</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 mt-20 sm:mt-24">
        {/* Progress Steps */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex items-center justify-center min-w-max px-4">
            {[1, 2, 3].map((stepNum, index) => (
              <div key={stepNum} className="flex items-center">
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      step >= stepNum
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                    }`}
                  >
                    {step > stepNum ? <Check className="w-5 h-5" /> : stepNum}
                  </div>
                </div>
                <div className="ml-2 mr-4">
                  <div className={`text-xs font-bold ${
                    step >= stepNum ? 'text-black' : 'text-gray-400'
                  }`}>
                    {stepNum === 1 && 'Address'}
                    {stepNum === 2 && 'Delivery'}
                    {stepNum === 3 && 'Review'}
                  </div>
                  <div className={`text-xs ${
                    step >= stepNum ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {stepNum === 1 && 'Where to deliver'}
                    {stepNum === 2 && 'How to deliver'}
                    {stepNum === 3 && 'Final confirmation'}
                  </div>
                </div>
                {index < 2 && (
                  <div className={`w-12 h-1 rounded-full transition-all duration-300 ${
                    step > stepNum ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-3 lg:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="animate-fadeIn">
                {step === 1 && renderLocationForm()}
                {step === 2 && renderDeliveryMethods()}
                {step === 3 && renderOrderSummary()}
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-20">
                <OrderSummaryCard 
                  title={step === 3 ? "Final Summary" : "Order Summary"} 
                  showButtons={false} 
                  stepNumber={step} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          
          .group:hover .group-hover\\:border-orange-300 {
            border-color: #fed7aa;
          }
        `}
      </style>
    </div>
  );
};

export default CheckoutPage;