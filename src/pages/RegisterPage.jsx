// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';

import toast from 'react-hot-toast';
import {
  Eye, ChefHat, EyeOff, User, Mail, Lock, Phone, AlertCircle, CheckCircle, Loader2,
  Wifi, WifiOff, Shield, AlertTriangle, Check, X
} from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', email: '', password: '', phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Real-time validation states
  const [realtimeErrors, setRealtimeErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});

  // Email checking states
  const [emailExists, setEmailExists] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailCheckError, setEmailCheckError] = useState(false);

  // Username checking states - no API available, so we track differently
  const [usernameExists, setUsernameExists] = useState(false);

  // Password strength checking
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Debouncing for API calls
  const [emailDebounceTimer, setEmailDebounceTimer] = useState(null);

  const icons = {
    firstName: <User className="w-5 h-5" />,
    lastName: <User className="w-5 h-5" />,
    username: <User className="w-5 h-5" />,
    email: <Mail className="w-5 h-5" />,
    password: <Lock className="w-5 h-5" />,
    phoneNumber: <Phone className="w-5 h-5" />,
  };

  const labels = {
    firstName: 'First Name',
    lastName: 'Last Name',
    username: 'Username',
    email: 'Email Address',
    password: 'Password',
    phoneNumber: 'Phone Number',
  };

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (generalError === 'No internet connection. Please check your network.') {
        setGeneralError('');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setGeneralError('No internet connection. Please check your network.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [generalError]);

  // Real-time validation function
  const validateFieldRealtime = (field, value, allFormData) => {
    if (!fieldTouched[field] || !value.trim()) return null;

    switch (field) {
      case 'firstName':
        if (value.length < 3) return 'First name should be at least 3 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'First name can only contain letters and spaces';
        if (allFormData.lastName && value.toLowerCase() === allFormData.lastName.toLowerCase()) {
          return 'First name should not be the same as last name';
        }
        return null;

      case 'lastName':
        if (value.length < 3) return 'Last name should be at least 3 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Last name can only contain letters and spaces';
        if (allFormData.firstName && value.toLowerCase() === allFormData.firstName.toLowerCase()) {
          return 'Last name should not be the same as first name';
        }
        return null;

      case 'username':
        if (value.length <= 3) return 'Username must be more than 3 characters';
        if (value.length > 20) return 'Username cannot exceed 20 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
        // Remove real-time username exists check
        return null;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        if (value.length > 254) return 'Email address is too long';
        if (emailExists) return 'This email is already registered';
        return null;

      case 'password':
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (value.length > 128) return 'Password cannot exceed 128 characters';
        const strength = passwordStrength;
        if (!strength.uppercase) return 'Password must contain at least one uppercase letter';
        if (!strength.lowercase) return 'Password must contain at least one lowercase letter';
        if (!strength.number) return 'Password must contain at least one number';
        return null;

      case 'phoneNumber':
        if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(value)) return 'Please enter a valid phone number';
        return null;

      default:
        return null;
    }
  };

  // Update real-time validation when form data changes
  useEffect(() => {
    const newRealtimeErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateFieldRealtime(field, formData[field], formData);
      if (error) {
        newRealtimeErrors[field] = error;
      }
    });
    setRealtimeErrors(newRealtimeErrors);
  }, [formData, fieldTouched, emailExists, passwordStrength]);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  // Debounced email check using the correct API endpoint
  const checkEmailAvailability = async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setEmailChecking(true);
    setEmailCheckError(false);

    try {
      const response = await axios.get(
        `/Authentication/emailexists/${encodeURIComponent(email)}`,
        { timeout: 5000 }
      );
      
      // The API returns boolean true/false
      setEmailExists(response.data === true);
    } catch (err) {
      console.error('Email check failed', err);
      setEmailCheckError(true);
      if (err.code === 'ECONNABORTED') {
        toast.error('Email check timed out. Please try again.');
      }
    } finally {
      setEmailChecking(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
    setGeneralError('');
    setSuccessMessage('');

    // Mark field as touched for real-time validation
    setFieldTouched(prev => ({ ...prev, [name]: true }));

    // Password strength checking
    if (name === 'password') {
      checkPasswordStrength(value);
    }

    // Debounced email checking
    if (name === 'email') {
      setEmailExists(false);
      setEmailCheckError(false);

      if (emailDebounceTimer) clearTimeout(emailDebounceTimer);

      const timer = setTimeout(() => {
        checkEmailAvailability(value);
      }, 800);

      setEmailDebounceTimer(timer);
    }

    // For username, we reset the exists state when user types
    // since we don't have a check API
    if (name === 'username') {
      setUsernameExists(false);
    }
  };

  // Handle field blur to mark as touched
  const handleBlur = (e) => {
    const { name } = e.target;
    setFieldTouched(prev => ({ ...prev, [name]: true }));
  };

  // Comprehensive validation for form submission
  const validate = () => {
    const newErr = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErr.firstName = ['First name is required.'];
    } else if (formData.firstName.length < 3) {
      newErr.firstName = ['First name should be at least 3 characters.'];
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErr.firstName = ['First name can only contain letters and spaces.'];
    } else if (formData.lastName && formData.firstName.toLowerCase() === formData.lastName.toLowerCase()) {
      newErr.firstName = ['First name should not be the same as last name.'];
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErr.lastName = ['Last name is required.'];
    } else if (formData.lastName.length < 3) {
      newErr.lastName = ['Last name should be at least 3 characters.'];
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErr.lastName = ['Last name can only contain letters and spaces.'];
    } else if (formData.firstName && formData.lastName.toLowerCase() === formData.firstName.toLowerCase()) {
      newErr.lastName = ['Last name should not be the same as first name.'];
    }

    // Username validation
    if (!formData.username.trim()) {
      newErr.username = ['Username is required.'];
    } else if (formData.username.length <= 3) {
      newErr.username = ['Username must be more than 3 characters.'];
    } else if (formData.username.length > 20) {
      newErr.username = ['Username cannot exceed 20 characters.'];
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErr.username = ['Username can only contain letters, numbers, and underscores.'];
    }
    // Remove username exists check from client-side validation

    // Email validation
    if (!formData.email.trim()) {
      newErr.email = ['Email is required.'];
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErr.email = ['Please enter a valid email address.'];
      } else if (formData.email.length > 254) {
        newErr.email = ['Email address is too long.'];
      } else if (emailExists) {
        newErr.email = ['This email is already registered.'];
      }
    }

    // Password validation
    if (!formData.password) {
      newErr.password = ['Password is required.'];
    } else if (formData.password.length < 8) {
      newErr.password = ['Password must be at least 8 characters.'];
    } else if (formData.password.length > 128) {
      newErr.password = ['Password cannot exceed 128 characters.'];
    } else {
      const strength = passwordStrength;
      if (!strength.uppercase || !strength.lowercase || !strength.number) {
        newErr.password = ['Password must contain uppercase, lowercase, and number.'];
      }
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErr.phoneNumber = ['Phone number is required.'];
    } else if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(formData.phoneNumber)) {
      newErr.phoneNumber = ['Please enter a valid phone number.'];
    }

    return newErr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check network connectivity
    if (!isOnline) {
      setGeneralError('No internet connection. Please check your network.');
      toast.error('No internet connection. Please check your network.');
      return;
    }

    setGeneralError('');
    setSuccessMessage('');

    // Client-side validation
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      
      // Show toast with specific errors
      const errorMessages = Object.values(clientErrors).flat();
      errorMessages.forEach(msg => toast.error(msg));
      return;
    }

    // Check for existing email
    if (emailExists) {
      setErrors({ email: ['This email is already registered.'] });
      toast.error('This email is already registered.');
      return;
    }

    // Check if still checking email
    if (emailChecking) {
      toast.error('Please wait while we verify your email address.');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await axios.post('Authentication/register', {
        ...formData,
        email: formData.email.trim().toLowerCase(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim()
      });

      setSuccessMessage('Registration completed successfully! Redirecting to login...');
      toast.success('Registration successful! Redirecting to login...');

      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      console.error('Registration error:', err);

      if (err.response) {
        const { status, data } = err.response;

        switch (status) {
          case 400:
            if (data.errors && typeof data.errors === 'object') {
              setErrors(data.errors);
              const errorMessages = Object.values(data.errors).flat();
              errorMessages.forEach(msg => toast.error(msg));
            } else if (Array.isArray(data.errors)) {
              setGeneralError(data.errors[0]);
              toast.error(data.errors[0]);
            } else if (data.message) {
              setGeneralError(data.message);
              toast.error(data.message);
            } else {
              setGeneralError('Invalid request. Please check your input.');
              toast.error('Invalid request. Please check your input.');
            }
            break;

          case 409:
            // Handle conflict responses (username/email already exists)
            if (data.message?.toLowerCase().includes('email')) {
              setErrors({ email: ['This email is already registered.'] });
              setEmailExists(true);
              toast.error('This email is already registered.');
            } else if (data.message?.toLowerCase().includes('username')) {
              setErrors({ username: ['This username is already taken.'] });
              setUsernameExists(true);
              toast.error('This username is already taken.');
            } else {
              setGeneralError(data.message || 'Registration conflict. Please try again.');
              toast.error(data.message || 'Registration conflict. Please try again.');
            }
            break;

          case 422:
            if (data.errors) {
              setErrors(data.errors);
              const errorMessages = Object.values(data.errors).flat();
              errorMessages.forEach(msg => toast.error(msg));
            } else if (data.message) {
              // Check if the message indicates username already exists
              if (data.message.toLowerCase().includes('username')) {
                setErrors({ username: ['This username is already taken.'] });
                setUsernameExists(true);
                toast.error('This username is already taken.');
              } else {
                setGeneralError(data.message);
                toast.error(data.message);
              }
            } else {
              setGeneralError('Invalid data provided.');
              toast.error('Invalid data provided.');
            }
            break;

          case 429:
            setGeneralError(data.message || 'Too many requests. Please try again later.');
            toast.error(data.message || 'Too many requests. Please try again later.');
            break;

          case 500:
            setGeneralError('Server error. Please try again later.');
            toast.error('Server error. Please try again later.');
            break;

          case 502:
            setGeneralError('Service temporarily unavailable. Please try again later.');
            toast.error('Service temporarily unavailable. Please try again later.');
            break;

          case 503:
            setGeneralError('Service is under maintenance. Please try again later.');
            toast.error('Service is under maintenance. Please try again later.');
            break;

          default:
            if (data?.message) {
              // Check if any error message indicates username conflict
              if (data.message.toLowerCase().includes('username')) {
                setErrors({ username: ['This username is already taken.'] });
                setUsernameExists(true);
                toast.error('This username is already taken.');
              } else {
                setGeneralError(data.message);
                toast.error(data.message);
              }
            } else if (data?.errorMessage) {
              setGeneralError(data.errorMessage);
              toast.error(data.errorMessage);
            } else {
              setGeneralError(`Registration failed (${status}). Please try again.`);
              toast.error(`Registration failed (${status}). Please try again.`);
            }
            break;
        }

      } else if (err.request) {
        if (err.code === 'ECONNABORTED') {
          setGeneralError('Request timeout. Please try again.');
          toast.error('Request timeout. Please try again.');
        } else if (err.code === 'ERR_NETWORK') {
          setGeneralError('Network error. Please check your connection.');
          toast.error('Network error. Please check your connection.');
        } else {
          setGeneralError('Unable to connect to server. Please try again.');
          toast.error('Unable to connect to server. Please try again.');
        }
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get field validation icon
  const getFieldValidationIcon = (field) => {
    if (field === 'email') {
      if (emailChecking) return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      if (emailCheckError) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      if (formData.email && !realtimeErrors.email && !emailExists && fieldTouched.email) return <Check className="w-5 h-5 text-green-500" />;
      if (emailExists || realtimeErrors.email) return <X className="w-5 h-5 text-red-500" />;
    }

    if (field === 'username') {
      // For username, only show client-side validation and server error state
      if (formData.username && !realtimeErrors.username && fieldTouched.username && !usernameExists) return <Check className="w-5 h-5 text-green-500" />;
      if (usernameExists) return <X className="w-5 h-5 text-red-500" />;
      if (realtimeErrors.username) return <X className="w-5 h-5 text-red-500" />;
    }

    // For other fields
    if (fieldTouched[field] && formData[field]) {
      if (realtimeErrors[field]) return <X className="w-5 h-5 text-red-500" />;
      return <Check className="w-5 h-5 text-green-500" />;
    }

    return null;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: `linear-gradient(to bottom right,
          ${theme.colors.gradientStart},
          ${theme.colors.gradientMiddle},
          ${theme.colors.gradientEnd})`
      }}
    >
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.colors.orangeLight }}
          >
            <User className="w-8 h-8" style={{ color: theme.colors.orangeDark }} />
          </div>
          <h2 className="text-3xl font-semibold" style={{ color: theme.colors.textDark }}>
            Create Account
          </h2>
        </div>

        {/* Network Status */}
        {!isOnline && (
          <div className="mb-4 p-2 border rounded-xl flex items-center justify-center gap-2 bg-gray-50">
            <WifiOff className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Offline</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div
            className="mb-4 p-3 rounded-xl flex items-center gap-2"
            style={{
              backgroundColor: theme.colors.orangeLight,
              borderColor: theme.colors.orange,
              color: theme.colors.textDark
            }}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* General Error */}
        {generalError && (
          <div
            className="mb-4 p-3 rounded-xl flex items-center gap-2"
            style={{
              backgroundColor: theme.colors.errorLight,
              borderColor: theme.colors.error,
              color: theme.colors.errorDark
            }}
          >
            <span className="flex-1">{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {Object.keys(formData).map(field => (
            <div key={field}>
              <label
                className="block text-sm mb-1"
                style={{ color: theme.colors.textDark }}
              >
                {labels[field]}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-400">
                  {icons[field]}
                </span>
                <input
                  type={field === 'password'
                    ? (showPassword ? 'text' : 'password')
                    : field === 'email' ? 'email' : 'text'
                  }
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-100 border focus:ring-2 focus:outline-none"
                  style={{
                    borderColor: realtimeErrors[field] || 
                                (field === 'email' && emailExists) || 
                                (field === 'username' && usernameExists)
                      ? theme.colors.error
                      : '#D1D5DB',
                    color: theme.colors.textDark
                  }}
                  placeholder={`Enter your ${labels[field].toLowerCase()}`}
                  disabled={isLoading}
                  autoComplete={field === 'password' ? 'new-password' : field}
                />

                {/* Field-specific right icons */}
                {field === 'password' && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword
                      ? <EyeOff className="w-5 h-5" />
                      : <Eye className="w-5 h-5" />}
                  </button>
                )}

                {field !== 'password' && (
                  <div className="absolute right-3 top-3.5">
                    {getFieldValidationIcon(field)}
                  </div>
                )}
              </div>

              {/* Real-time error messages */}
              {realtimeErrors[field] && (
                <p className="text-sm mt-1" style={{ color: theme.colors.error }}>
                  {realtimeErrors[field]}
                </p>
              )}

              {/* Username server error display */}
              {field === 'username' && usernameExists && (
                <p className="text-sm mt-1" style={{ color: theme.colors.error }}>
                  This username is already taken
                </p>
              )}

              {/* Password strength indicator */}
              {field === 'password' && formData.password && fieldTouched.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${passwordStrength.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={passwordStrength.length ? 'text-green-600' : 'text-gray-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${passwordStrength.uppercase && passwordStrength.lowercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={passwordStrength.uppercase && passwordStrength.lowercase ? 'text-green-600' : 'text-gray-500'}>
                      Uppercase and lowercase letters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${passwordStrength.number ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={passwordStrength.number ? 'text-green-600' : 'text-gray-500'}>
                      At least one number
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isLoading || emailExists || usernameExists || !isOnline}
            className="w-full py-3 font-semibold text-white rounded-xl transition duration-300 flex justify-center items-center gap-2"
            style={{
              background: `linear-gradient(to right,
                ${theme.colors.orange},
                ${theme.colors.orangeDark})`,
              opacity: (isLoading || emailExists || usernameExists || !isOnline) ? 0.6 : 1
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Account...
              </>
            ) : !isOnline ? (
              <>
                <WifiOff className="w-5 h-5" />
                No Connection
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: theme.colors.textGray }}>
          Already have an account?{' '}
          <button
            className="font-medium hover:underline"
            style={{ color: theme.colors.orange }}
            onClick={() => navigate('/login')}
            disabled={isLoading}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}