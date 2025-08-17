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

  // Username checking states - REMOVED problematic checking
  const [usernameExists, setUsernameExists] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameCheckError, setUsernameCheckError] = useState(false);

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
        if (value.length < 3) return 'First Name must be at least 3 characters long.';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'First name can only contain letters and spaces.';
        if (allFormData.lastName && value.toLowerCase() === allFormData.lastName.toLowerCase()) {
          return 'First Name and Last Name cannot be the same.';
        }
        return null;

      case 'lastName':
        if (value.length < 3) return 'Last Name must be at least 3 characters long.';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Last name can only contain letters and spaces.';
        if (allFormData.firstName && value.toLowerCase() === allFormData.firstName.toLowerCase()) {
          return 'First Name and Last Name cannot be the same.';
        }
        return null;

      case 'username':
        if (value.length < 3) return 'Username must be at least 3 characters long.';
        if (value.length > 20) return 'Username cannot exceed 20 characters.';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores.';
        return null;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address.';
        if (value.length > 254) return 'Email address is too long.';
        return null;

      case 'password':
        if (value.length < 8) return 'Hey! Your password is too short. Make it at least 8 characters.';
        if (value.length > 128) return 'Password cannot exceed 128 characters.';
        const strength = passwordStrength;
        if (!strength.uppercase) return 'Include at least one uppercase letter (A-Z) in your password.';
        if (!strength.lowercase) return 'Include at least one lowercase letter (a-z) in your password.';
        if (!strength.number) return 'Add at least one number (0-9) to your password.';
        if (!strength.special) return 'Add a special character like !@#$%^&* to your password.';
        return null;

      case 'phoneNumber':
        if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(value)) return 'Please enter a valid phone number.';
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
  }, [formData, fieldTouched, passwordStrength]);

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

  // Email availability check using the correct API endpoint
  const checkEmailAvailability = async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setEmailChecking(true);
    setEmailCheckError(false);
    setEmailExists(false);

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
        console.log('Email check timed out');
      }
    } finally {
      setEmailChecking(false);
    }
  };

  // Enhanced auto-login function with proper navigation
  const performAutoLogin = async (email, password) => {
    try {
      const loginResponse = await axios.post('Authentication/login', {
        email: email.trim().toLowerCase(),
        password: password
      });

      if (loginResponse.data && loginResponse.data.token) {
        // Store authentication data
        localStorage.setItem('token', loginResponse.data.token);
        localStorage.setItem('user', JSON.stringify({
          username: loginResponse.data.username,
          email: loginResponse.data.email
        }));

        // Clear any existing scroll position data
        sessionStorage.removeItem('scrollPosition');
        
        // Navigate to home page and ensure it starts from top
        navigate('/', { replace: true });
        
        // Scroll to top after navigation with a small delay to ensure page is loaded
        setTimeout(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 100);

        return true;
      }
      return false;
    } catch (loginErr) {
      console.error('Auto-login failed:', loginErr);
      // Clear scroll position before navigating to login
      sessionStorage.removeItem('scrollPosition');
      navigate('/login', { replace: true });
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }, 100);
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    
    // Clear errors for this field
    setErrors(prev => ({ ...prev, [name]: [] }));
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

    // Reset username existence when typing (will be checked on submit)
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
      newErr.firstName = ['First Name must be at least 3 characters long.'];
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErr.firstName = ['First name can only contain letters and spaces.'];
    } else if (formData.lastName && formData.firstName.toLowerCase() === formData.lastName.toLowerCase()) {
      newErr.firstName = ['First Name and Last Name cannot be the same.'];
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErr.lastName = ['Last name is required.'];
    } else if (formData.lastName.length < 3) {
      newErr.lastName = ['Last Name must be at least 3 characters long.'];
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErr.lastName = ['Last name can only contain letters and spaces.'];
    } else if (formData.firstName && formData.lastName.toLowerCase() === formData.firstName.toLowerCase()) {
      newErr.lastName = ['First Name and Last Name cannot be the same.'];
    }

    // Username validation
    if (!formData.username.trim()) {
      newErr.username = ['Username is required.'];
    } else if (formData.username.length < 3) {
      newErr.username = ['Username must be at least 3 characters long.'];
    } else if (formData.username.length > 20) {
      newErr.username = ['Username cannot exceed 20 characters.'];
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErr.username = ['Username can only contain letters, numbers, and underscores.'];
    }

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
        newErr.email = ['This email is already taken. Try logging in instead?'];
      }
    }

    // Password validation
    if (!formData.password) {
      newErr.password = ['Password is required.'];
    } else if (formData.password.length < 8) {
      newErr.password = ['Hey! Your password is too short. Make it at least 8 characters.'];
    } else if (formData.password.length > 128) {
      newErr.password = ['Password cannot exceed 128 characters.'];
    } else {
      const strength = passwordStrength;
      if (!strength.uppercase) {
        newErr.password = ['Include at least one uppercase letter (A-Z) in your password.'];
      } else if (!strength.lowercase) {
        newErr.password = ['Include at least one lowercase letter (a-z) in your password.'];
      } else if (!strength.number) {
        newErr.password = ['Add at least one number (0-9) to your password.'];
      } else if (!strength.special) {
        newErr.password = ['Add a special character like !@#$%^&* to your password.'];
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

  // Process server errors and map them to appropriate fields
  const processServerErrors = (errorData) => {
    const newErrors = {};
    console.log('Processing server errors:', errorData);
    
    if (errorData.errors) {
      if (Array.isArray(errorData.errors)) {
        console.log('Processing array errors:', errorData.errors);
        
        errorData.errors.forEach((errorMsg, index) => {
          console.log(`Processing array error ${index}:`, errorMsg);
          
          if (typeof errorMsg === 'string') {
            const lowerMessage = errorMsg.toLowerCase();
            
            if (lowerMessage.includes('username')) {
              if (lowerMessage.includes('taken') || lowerMessage.includes('already') || lowerMessage.includes('exists')) {
                newErrors.username = [errorMsg];
                setUsernameExists(true);
              } else {
                newErrors.username = [errorMsg];
              }
            } else if (lowerMessage.includes('email')) {
              if (lowerMessage.includes('taken') || lowerMessage.includes('already') || lowerMessage.includes('exists')) {
                newErrors.email = [errorMsg];
                setEmailExists(true);
              } else {
                newErrors.email = [errorMsg];
              }
            } else if (lowerMessage.includes('first name')) {
              newErrors.firstName = [errorMsg];
            } else if (lowerMessage.includes('last name')) {
              newErrors.lastName = [errorMsg];
            } else if (lowerMessage.includes('password')) {
              newErrors.password = [errorMsg];
            } else if (lowerMessage.includes('phone')) {
              newErrors.phoneNumber = [errorMsg];
            } else {
              setGeneralError(errorMsg);
            }
          }
        });
      } 
      else if (typeof errorData.errors === 'object') {
        Object.keys(errorData.errors).forEach(field => {
          const fieldKey = field.toLowerCase();
          const errorMessages = Array.isArray(errorData.errors[field]) 
            ? errorData.errors[field] 
            : [errorData.errors[field]];
          
          console.log(`Processing field error: ${field} -> ${fieldKey}:`, errorMessages);
          
          if (fieldKey === 'firstname' || fieldKey === 'first_name') {
            newErrors.firstName = errorMessages;
          } else if (fieldKey === 'lastname' || fieldKey === 'last_name') {
            newErrors.lastName = errorMessages;
          } else if (fieldKey === 'username') {
            newErrors.username = errorMessages;
            const errorText = errorMessages.join(' ').toLowerCase();
            if (errorText.includes('taken') || errorText.includes('exists') || errorText.includes('already')) {
              setUsernameExists(true);
            }
          } else if (fieldKey === 'email') {
            newErrors.email = errorMessages;
            const errorText = errorMessages.join(' ').toLowerCase();
            if (errorText.includes('taken') || errorText.includes('exists') || errorText.includes('already')) {
              setEmailExists(true);
            }
          } else if (fieldKey === 'password') {
            newErrors.password = errorMessages;
          } else if (fieldKey === 'phonenumber' || fieldKey === 'phone_number') {
            newErrors.phoneNumber = errorMessages;
          } else {
            const matchingKey = Object.keys(formData).find(key => key.toLowerCase() === fieldKey);
            if (matchingKey) {
              newErrors[matchingKey] = errorMessages;
            }
          }
        });
      }
    }
    
    const errorMessage = errorData.message || errorData.errorMessage || '';
    if (errorMessage && Object.keys(newErrors).length === 0) {
      const lowerMessage = errorMessage.toLowerCase();
      console.log('Processing error message:', errorMessage);
      
      if (lowerMessage.includes('username')) {
        if (lowerMessage.includes('taken') || lowerMessage.includes('exists') || lowerMessage.includes('already')) {
          newErrors.username = ['This username is already taken. Please choose another.'];
          setUsernameExists(true);
        } else if (lowerMessage.includes('characters')) {
          newErrors.username = ['Username must be at least 3 characters long.'];
        } else {
          newErrors.username = [errorMessage];
        }
      } else if (lowerMessage.includes('email')) {
        if (lowerMessage.includes('taken') || lowerMessage.includes('exists') || lowerMessage.includes('already')) {
          newErrors.email = ['This email is already taken. Try logging in instead?'];
          setEmailExists(true);
        } else if (lowerMessage.includes('valid')) {
          newErrors.email = ['Please enter a valid email address.'];
        } else {
          newErrors.email = [errorMessage];
        }
      } else if (lowerMessage.includes('password')) {
        if (lowerMessage.includes('short')) {
          newErrors.password = ['Hey! Your password is too short. Make it at least 8 characters.'];
        } else if (lowerMessage.includes('digit')) {
          newErrors.password = ['Add at least one number (0-9) to your password.'];
        } else if (lowerMessage.includes('lowercase')) {
          newErrors.password = ['Include at least one lowercase letter (a-z) in your password.'];
        } else if (lowerMessage.includes('uppercase')) {
          newErrors.password = ['Include at least one uppercase letter (A-Z) in your password.'];
        } else if (lowerMessage.includes('special')) {
          newErrors.password = ['Add a special character like !@#$%^&* to your password.'];
        } else {
          newErrors.password = [errorMessage];
        }
      } else if (lowerMessage.includes('first name')) {
        if (lowerMessage.includes('same')) {
          newErrors.firstName = ['First Name and Last Name cannot be the same.'];
        } else if (lowerMessage.includes('characters')) {
          newErrors.firstName = ['First Name must be at least 3 characters long.'];
        } else {
          newErrors.firstName = [errorMessage];
        }
      } else if (lowerMessage.includes('last name')) {
        if (lowerMessage.includes('same')) {
          newErrors.lastName = ['First Name and Last Name cannot be the same.'];
        } else if (lowerMessage.includes('characters')) {
          newErrors.lastName = ['Last Name must be at least 3 characters long.'];
        } else {
          newErrors.lastName = [errorMessage];
        }
      } else if (lowerMessage.includes('phone')) {
        newErrors.phoneNumber = [errorMessage];
      } else if (lowerMessage !== 'validation failed') {
        console.log('Setting as general error:', errorMessage);
        setGeneralError(errorMessage);
      }
    }
    
    console.log('Final processed errors:', newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check network connectivity
    if (!isOnline) {
      setGeneralError('No internet connection. Please check your network.');
      return;
    }

    setGeneralError('');
    setSuccessMessage('');

    // Client-side validation
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }

    // Check if email exists (from real-time check)
    if (emailExists) {
      setErrors({ email: ['This email is already taken. Try logging in instead?'] });
      return;
    }

    // Check if still checking email
    if (emailChecking) {
      setGeneralError('Please wait while we verify your email.');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim()
      };

      console.log('Sending registration data:', registrationData);

      const response = await axios.post('Authentication/register', registrationData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Registration successful:', response.data);
      setSuccessMessage('Registration completed successfully! Logging you in...');
      toast.success('Registration successful! Logging you in...');

      // Auto-login after successful registration with enhanced navigation
      setTimeout(async () => {
        const loginSuccess = await performAutoLogin(formData.email, formData.password);
        if (!loginSuccess) {
          toast.error('Registration successful, but auto-login failed. Please login manually.');
        }
      }, 1500); // Increased delay slightly for better UX

    } catch (err) {
      console.error('Registration error:', err);

      if (err.response) {
        const { status, data } = err.response;
        console.log('Error response:', { status, data });

        // Process server errors and map them to fields
        const fieldErrors = processServerErrors(data);
        
        if (Object.keys(fieldErrors).length > 0) {
          console.log('Setting field errors:', fieldErrors);
          setErrors(fieldErrors);
        } else {
          // Fallback error handling based on status codes
          switch (status) {
            case 400:
              setGeneralError(data.message || data.errorMessage || 'Invalid request. Please check your input.');
              break;
            case 409:
              const conflictMessage = data.message || data.errorMessage || '';
              if (conflictMessage.toLowerCase().includes('username')) {
                setErrors({ username: ['This username is already taken. Please choose another.'] });
                setUsernameExists(true);
              } else if (conflictMessage.toLowerCase().includes('email')) {
                setErrors({ email: ['This email is already taken. Try logging in instead?'] });
                setEmailExists(true);
              } else {
                setGeneralError(conflictMessage || 'Registration conflict. Please try again.');
              }
              break;
            case 422:
              setGeneralError(data.message || data.errorMessage || 'Invalid data provided.');
              break;
            case 429:
              setGeneralError(data.message || data.errorMessage || 'Too many requests. Please try again later.');
              break;
            case 500:
              setGeneralError('Server error. Please try again later.');
              break;
            case 502:
              setGeneralError('Service temporarily unavailable. Please try again later.');
              break;
            case 503:
              setGeneralError('Service is under maintenance. Please try again later.');
              break;
            default:
              setGeneralError(`Registration failed (${status}). Please try again.`);
              break;
          }
        }

      } else if (err.request) {
        if (err.code === 'ECONNABORTED') {
          setGeneralError('Request timeout. Please try again.');
        } else if (err.code === 'ERR_NETWORK') {
          setGeneralError('Network error. Please check your connection.');
        } else {
          setGeneralError('Unable to connect to server. Please try again.');
        }
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
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
      if (emailExists) return <X className="w-5 h-5 text-red-500" />;
      if (getFieldError(field)) return <X className="w-5 h-5 text-red-500" />;
      if (formData.email && fieldTouched.email && !getFieldError(field)) return <Check className="w-5 h-5 text-green-500" />;
    }

    if (field === 'username') {
      if (getFieldError(field)) return <X className="w-5 h-5 text-red-500" />;
      if (formData.username && fieldTouched.username && !getFieldError(field)) return <Check className="w-5 h-5 text-green-500" />;
    }

    // For other fields
    if (fieldTouched[field] && formData[field]) {
      if (getFieldError(field)) return <X className="w-5 h-5 text-red-500" />;
      return <Check className="w-5 h-5 text-green-500" />;
    }

    return null;
  };

  // Helper function to get field error message
  const getFieldError = (field) => {
    // Server-side validation errors (highest priority)
    if (errors[field] && errors[field].length > 0) return errors[field][0];
    
    // Real-time validation errors (lower priority)
    if (realtimeErrors[field]) return realtimeErrors[field];
    
    // Availability errors for email
    if (field === 'email' && emailExists) return 'This email is already taken. Try logging in instead?';
    
    // Availability errors for username
    if (field === 'username' && usernameExists) return 'This username is already taken. Please choose another.';
    
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
            <AlertCircle className="w-4 h-4" />
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
                    borderColor: getFieldError(field)
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

              {/* Enhanced error messages display */}
              {getFieldError(field) && (
                <p className="text-sm mt-1 flex items-center gap-1" style={{ color: theme.colors.error }}>
                  <AlertCircle className="w-4 h-4" />
                  {getFieldError(field)}
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
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${passwordStrength.special ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={passwordStrength.special ? 'text-green-600' : 'text-gray-500'}>
                      Special character (!@#$%^&*)
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isLoading || emailExists || !isOnline || emailChecking}
            className="w-full py-3 font-semibold text-white rounded-xl transition duration-300 flex justify-center items-center gap-2"
            style={{
              background: `linear-gradient(to right,
                ${theme.colors.orange},
                ${theme.colors.orangeDark})`,
              opacity: (isLoading || emailExists || !isOnline || emailChecking) ? 0.6 : 1
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
            ) : emailChecking ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Validating Email...
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