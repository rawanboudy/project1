// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';


import toast from 'react-hot-toast';
import {
  Eye, ChefHat,EyeOff, User, Mail, Lock, Phone, AlertCircle, CheckCircle, Loader2,
  Wifi, WifiOff, Shield, AlertTriangle, Check, X
} from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName:'', username:'', email:'', password:'', phoneNumber:''
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [registrationAttempts, setRegistrationAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  // Email and username checking states
  const [emailExists, setEmailExists] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailCheckError, setEmailCheckError] = useState(false);
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
  const [usernameDebounceTimer, setUsernameDebounceTimer] = useState(null);

  const MAX_REGISTRATION_ATTEMPTS = 3;
  const BLOCK_DURATION = 600000; // 10 minutes

  const icons = {
    firstName:   <User  className="w-5 h-5"/>,
    lastName:    <User  className="w-5 h-5"/>,
    username:    <User  className="w-5 h-5"/>,
    email:       <Mail  className="w-5 h-5"/>,
    password:    <Lock  className="w-5 h-5"/>,
    phoneNumber: <Phone className="w-5 h-5"/>,
  };

  const labels = {
    firstName:   'First Name',
    lastName:    'Last Name',
    username:    'Username',
    email:       'Email Address',
    password:    'Password',
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

  // Check for registration blocking on mount
  useEffect(() => {
    const blockEndTime = localStorage.getItem('registrationBlockEndTime');
    if (blockEndTime && new Date().getTime() < parseInt(blockEndTime)) {
      setIsBlocked(true);
      const remaining = parseInt(blockEndTime) - new Date().getTime();
      setBlockTimeRemaining(Math.ceil(remaining / 1000));
    }

    const attempts = parseInt(localStorage.getItem('registrationAttempts') || '0');
    setRegistrationAttempts(attempts);
  }, []);

  // Block timer countdown
  useEffect(() => {
    let interval;
    if (isBlocked && blockTimeRemaining > 0) {
      interval = setInterval(() => {
        setBlockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            localStorage.removeItem('registrationBlockEndTime');
            localStorage.removeItem('registrationAttempts');
            setRegistrationAttempts(0);
            setGeneralError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isBlocked, blockTimeRemaining]);

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

  // Debounced email check
  const checkEmailAvailability = async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    
    setEmailChecking(true);
    setEmailCheckError(false);
    
    try {
      const response = await axios.get(
        `Authentication/emailexists?email=${encodeURIComponent(email)}`,
        { timeout: 5000 }
      );
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

  // Debounced username check
  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) return;
    
    setUsernameChecking(true);
    setUsernameCheckError(false);
    
    try {
      const response = await axios.get(
        `Authentication/usernameexists?username=${encodeURIComponent(username)}`,
        { timeout: 5000 }
      );
      setUsernameExists(response.data === true);
    } catch (err) {
      console.error('Username check failed', err);
      setUsernameCheckError(true);
      if (err.code === 'ECONNABORTED') {
        toast.error('Username check timed out. Please try again.');
      }
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
    setGeneralError('');
    setSuccessMessage('');

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

    // Debounced username checking
    if (name === 'username') {
      setUsernameExists(false);
      setUsernameCheckError(false);
      
      if (usernameDebounceTimer) clearTimeout(usernameDebounceTimer);
      
      const timer = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 800);
      
      setUsernameDebounceTimer(timer);
    }
  };

  // Comprehensive validation
  const validate = () => {
    const newErr = {};
    
    // First name validation
    if (!formData.firstName.trim()) {
      newErr.firstName = ['First name is required.'];
    } else if (formData.firstName.length < 2) {
      newErr.firstName = ['First name must be at least 2 characters.'];
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErr.firstName = ['First name can only contain letters and spaces.'];
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErr.lastName = ['Last name is required.'];
    } else if (formData.lastName.length < 2) {
      newErr.lastName = ['Last name must be at least 2 characters.'];
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErr.lastName = ['Last name can only contain letters and spaces.'];
    }

    // Username validation
    if (!formData.username.trim()) {
      newErr.username = ['Username is required.'];
    } else if (formData.username.length < 3) {
      newErr.username = ['Username must be at least 3 characters.'];
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

  // Handle failed registration
  const handleFailedRegistration = () => {
    const newAttempts = registrationAttempts + 1;
    setRegistrationAttempts(newAttempts);
    localStorage.setItem('registrationAttempts', newAttempts.toString());

    if (newAttempts >= MAX_REGISTRATION_ATTEMPTS) {
      const blockEndTime = new Date().getTime() + BLOCK_DURATION;
      localStorage.setItem('registrationBlockEndTime', blockEndTime.toString());
      setIsBlocked(true);
      setBlockTimeRemaining(Math.ceil(BLOCK_DURATION / 1000));
      setGeneralError(`Too many registration attempts. Please try again in ${Math.ceil(BLOCK_DURATION / 60000)} minutes.`);
    }
  };

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if blocked
    if (isBlocked) {
      toast.error(`Please wait ${Math.ceil(blockTimeRemaining / 60)} minutes before trying again.`);
      return;
    }

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
      toast.error('Please fix the highlighted errors.');
      return;
    }

    // Check for existing email/username
    if (emailExists) {
      setErrors({ email: ['That email is already registered.'] });
      toast.error('That email is already registered.');
      return;
    }
    if (usernameExists) {
      setErrors({ username: ['That username is already taken.'] });
      toast.error('That username is already taken.');
      return;
    }

    // Check if still checking email/username
    if (emailChecking || usernameChecking) {
      toast.error('Please wait while we verify your information.');
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
      
      // Reset registration attempts
      localStorage.removeItem('registrationAttempts');
      localStorage.removeItem('registrationBlockEndTime');
      
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response) {
        const { status, data } = err.response;

        switch (status) {
          case 400:
            // Bad Request - Validation errors
            if (data.errors && typeof data.errors === 'object') {
              setErrors(data.errors);
              toast.error('Please fix the highlighted errors.');
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
            // Conflict - Email or username already exists
            if (data.message?.includes('email')) {
              setErrors({ email: ['That email is already registered.'] });
              setEmailExists(true);
              toast.error('That email is already registered.');
            } else if (data.message?.includes('username')) {
              setErrors({ username: ['That username is already taken.'] });
              setUsernameExists(true);
              toast.error('That username is already taken.');
            } else {
              setGeneralError(data.message || 'Registration conflict. Please try again.');
              toast.error(data.message || 'Registration conflict. Please try again.');
            }
            break;

          case 422:
            // Unprocessable Entity - Validation errors
            if (data.errors) {
              setErrors(data.errors);
              toast.error('Please fix the highlighted errors.');
            } else {
              setGeneralError(data.message || 'Invalid data provided.');
              toast.error(data.message || 'Invalid data provided.');
            }
            break;

          case 429:
            // Too Many Requests
            setGeneralError(data.message || 'Too many requests. Please try again later.');
            toast.error(data.message || 'Too many requests. Please try again later.');
            break;

          case 500:
            // Internal Server Error
            setGeneralError('Server error. Please try again later.');
            toast.error('Server error. Please try again later.');
            break;

          case 502:
            // Bad Gateway
            setGeneralError('Service temporarily unavailable. Please try again later.');
            toast.error('Service temporarily unavailable. Please try again later.');
            break;

          case 503:
            // Service Unavailable
            setGeneralError('Service is under maintenance. Please try again later.');
            toast.error('Service is under maintenance. Please try again later.');
            break;

          default:
            if (data?.message) {
              setGeneralError(data.message);
              toast.error(data.message);
            } else if (data?.errorMessage) {
              setGeneralError(data.errorMessage);
              toast.error(data.errorMessage);
            } else {
              setGeneralError(`Registration failed (${status}). Please try again.`);
              toast.error(`Registration failed (${status}). Please try again.`);
            }
            break;
        }

        // Handle failed registration attempt
        if (status !== 409) { // Don't count conflicts as failed attempts
          handleFailedRegistration();
        }

      } else if (err.request) {
        // Network error
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
        // Other error
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
      if (formData.email && !errors.email && !emailExists) return <Check className="w-5 h-5 text-green-500" />;
      if (emailExists) return <X className="w-5 h-5 text-red-500" />;
    }
    
    if (field === 'username') {
      if (usernameChecking) return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      if (usernameCheckError) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      if (formData.username && !errors.username && !usernameExists) return <Check className="w-5 h-5 text-green-500" />;
      if (usernameExists) return <X className="w-5 h-5 text-red-500" />;
    }
    
    return null;
  };

  // Get error icon based on error type
  const getErrorIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (isBlocked) return <Shield className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
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
            {getErrorIcon()}
            <span className="flex-1">{generalError}</span>
            {isBlocked && blockTimeRemaining > 0 && (
              <span className="text-sm font-mono">
                {formatTimeRemaining(blockTimeRemaining)}
              </span>
            )}
          </div>
        )}

        {/* Registration Attempts Warning */}
        {registrationAttempts > 0 && registrationAttempts < MAX_REGISTRATION_ATTEMPTS && !isBlocked && (
          <div
            className="mb-4 p-3 border rounded-xl flex items-center gap-2"
            style={{
              backgroundColor: '#FEF3C7',
              borderColor: '#F59E0B',
              color: '#92400E'
            }}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>
              {registrationAttempts} failed attempt{registrationAttempts > 1 ? 's' : ''}. 
              {MAX_REGISTRATION_ATTEMPTS - registrationAttempts} remaining.
            </span>
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
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-100 border focus:ring-2 focus:outline-none"
                  style={{
                    borderColor: errors[field] || 
                                (field === 'email' && emailExists) || 
                                (field === 'username' && usernameExists)
                      ? theme.colors.error
                      : '#D1D5DB',
                    color: theme.colors.textDark
                  }}
                  placeholder={`Enter your ${labels[field].toLowerCase()}`}
                  disabled={isLoading || isBlocked}
                  autoComplete={field === 'password' ? 'new-password' : field}
                />
                
                {/* Field-specific right icons */}
                {field === 'password' && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    disabled={isLoading || isBlocked}
                  >
                    {showPassword
                      ? <EyeOff className="w-5 h-5"/>
                      : <Eye className="w-5 h-5"/>}
                  </button>
                )}
                
                {(field === 'email' || field === 'username') && (
                  <div className="absolute right-3 top-3.5">
                    {getFieldValidationIcon(field)}
                  </div>
                )}
              </div>
              
              {/* Field errors */}
              {errors[field] && (
                <p className="text-sm mt-1" style={{ color: theme.colors.error }}>
                  {errors[field][0]}
                </p>
              )}
              
              {/* Live email feedback */}
              {field === 'email' && !errors.email && emailExists && !emailChecking && (
                <p className="text-sm mt-1" style={{ color: theme.colors.error }}>
                  That email is already registered.
                </p>
              )}
              
              {/* Live username feedback */}
              {field === 'username' && !errors.username && usernameExists && !usernameChecking && (
                <p className="text-sm mt-1" style={{ color: theme.colors.error }}>
                  That username is already taken.
                </p>
              )}
              
              {/* Password strength indicator */}
              {field === 'password' && formData.password && (
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
            disabled={isLoading || emailExists || usernameExists || isBlocked || !isOnline}
            className="w-full py-3 font-semibold text-white rounded-xl transition duration-300 flex justify-center items-center gap-2"
            style={{
              background: `linear-gradient(to right,
                ${theme.colors.orange},
                ${theme.colors.orangeDark})`,
              opacity: (isLoading || emailExists || usernameExists || isBlocked || !isOnline) ? 0.6 : 1
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin"/>
                Creating Account...
              </>
            ) : isBlocked ? (
              <>
                <Shield className="w-5 h-5" />
                Blocked ({formatTimeRemaining(blockTimeRemaining)})
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