import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import theme from '../theme';
import {
  Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, Wifi, WifiOff, Shield, AlertTriangle
} from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const navigate = useNavigate();

  // Maximum login attempts before blocking
  const MAX_LOGIN_ATTEMPTS = 5;
  const BLOCK_DURATION = 300000; // 5 minutes in milliseconds

  // Safari-compatible storage utility
  const SafariStorage = {
    setItem: (key, value) => {
      try {
        // Try localStorage first
        localStorage.setItem(key, value);
        
        // For Safari, also set a cookie as fallback
        if (this.isSafari()) {
          const expiryDate = new Date();
          expiryDate.setTime(expiryDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
          document.cookie = `${key}=${encodeURIComponent(value)};expires=${expiryDate.toUTCString()};path=/;SameSite=Lax;Secure=${window.location.protocol === 'https:'}`;
        }
        return true;
      } catch (error) {
        console.warn('Storage failed, using cookie fallback:', error);
        // Fallback to cookie
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.cookie = `${key}=${encodeURIComponent(value)};expires=${expiryDate.toUTCString()};path=/;SameSite=Lax;Secure=${window.location.protocol === 'https:'}`;
        return true;
      }
    },

    getItem: (key) => {
      try {
        // Try localStorage first
        const value = localStorage.getItem(key);
        if (value !== null) {
          return value;
        }
      } catch (error) {
        console.warn('localStorage access failed:', error);
      }

      // Fallback to cookie
      const name = key + "=";
      const decodedCookie = decodeURIComponent(document.cookie);
      const ca = decodedCookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
          return decodeURIComponent(c.substring(name.length, c.length));
        }
      }
      return null;
    },

    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('localStorage removal failed:', error);
      }
      
      // Remove cookie
      document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    },

    isSafari: () => {
      const userAgent = navigator.userAgent;
      return /^((?!chrome|android).)*safari/i.test(userAgent) || 
             /iPad|iPhone|iPod/.test(userAgent);
    }
  };

  // Enhanced token validation with Safari compatibility
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      // Basic JWT structure check
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Try to decode payload
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token is expired (with 5-minute buffer)
      if (payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const bufferTime = 300; // 5 minutes
        return payload.exp > (currentTime + bufferTime);
      }
      
      // If no exp claim, check stored expiry
      const storedExpiry = SafariStorage.getItem('tokenExpiry');
      if (storedExpiry) {
        const expiryTime = new Date(storedExpiry).getTime();
        return expiryTime > (Date.now() + (5 * 60 * 1000)); // 5 minute buffer
      }
      
      return true; // If no expiry info, assume valid
    } catch (error) {
      console.warn('Token validation error:', error);
      return false;
    }
  };

  // Enhanced session check with Safari compatibility
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const token = SafariStorage.getItem('token');
        
        if (token && isTokenValid(token)) {
          // Set axios default header for authentication
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          try {
            // Verify token is still valid by fetching user info
            const response = await axios.get('/Authentication/user', {
              timeout: 10000, // 10 second timeout
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });
            
            if (response.data) {
              // Token is valid, store user info and redirect
              SafariStorage.setItem('userInfo', JSON.stringify(response.data));
              SafariStorage.setItem('lastActivity', Date.now().toString());
              navigate('/');
              return;
            }
          } catch (apiError) {
            console.warn('User verification failed:', apiError);
            // If API call fails but token looks valid, still proceed
            if (apiError.response?.status !== 401 && apiError.response?.status !== 403) {
              // Network error, but token might be valid
              const userInfo = SafariStorage.getItem('userInfo');
              if (userInfo) {
                navigate('/');
                return;
              }
            }
          }
        }
        
        // Token is invalid or expired, clear stored data
        clearAuthData();
        
      } catch (error) {
        console.error('Session check error:', error);
        clearAuthData();
        
        if (error.response?.status === 401) {
          setSessionExpired(true);
          setGeneralError('Your session has expired. Please log in again.');
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkExistingSession();
  }, [navigate]);

  // Clear all authentication data
  const clearAuthData = () => {
    const keysToRemove = [
      'token', 'userInfo', 'tokenExpiry', 'refreshToken', 'tokenType',
      'userPermissions', 'userRoles', 'sessionId', 'lastActivity'
    ];
    
    keysToRemove.forEach(key => SafariStorage.removeItem(key));
    delete axios.defaults.headers.common['Authorization'];
  };

  // Check for session expiration and login attempts on component mount
  useEffect(() => {
    // Check for existing session expiration
    const sessionExpiredFlag = sessionStorage.getItem('sessionExpired');
    if (sessionExpiredFlag === 'true') {
      setSessionExpired(true);
      setGeneralError('Your session has expired. Please log in again.');
      sessionStorage.removeItem('sessionExpired');
    }

    // Check if user is currently blocked
    const blockEndTime = SafariStorage.getItem('loginBlockEndTime');
    if (blockEndTime && new Date().getTime() < parseInt(blockEndTime)) {
      setIsBlocked(true);
      const remaining = parseInt(blockEndTime) - new Date().getTime();
      setBlockTimeRemaining(Math.ceil(remaining / 1000));
    }

    // Get current login attempts
    const attempts = parseInt(SafariStorage.getItem('loginAttempts') || '0');
    setLoginAttempts(attempts);
  }, []);

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

  // Block timer countdown
  useEffect(() => {
    let interval;
    if (isBlocked && blockTimeRemaining > 0) {
      interval = setInterval(() => {
        setBlockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            SafariStorage.removeItem('loginBlockEndTime');
            SafariStorage.removeItem('loginAttempts');
            setLoginAttempts(0);
            setGeneralError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isBlocked, blockTimeRemaining]);

  // Activity tracking for Safari
  useEffect(() => {
    const updateActivity = () => {
      const token = SafariStorage.getItem('token');
      if (token && isTokenValid(token)) {
        SafariStorage.setItem('lastActivity', Date.now().toString());
      }
    };

    // Update activity on various user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Periodic activity check
    const activityInterval = setInterval(() => {
      const lastActivity = SafariStorage.getItem('lastActivity');
      const token = SafariStorage.getItem('token');
      
      if (token && lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        // If inactive for more than 30 days, clear session
        if (timeSinceLastActivity > (30 * 24 * 60 * 60 * 1000)) {
          clearAuthData();
          setSessionExpired(true);
          setGeneralError('Session expired due to inactivity. Please log in again.');
        }
      }
    }, 60000); // Check every minute

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(activityInterval);
    };
  }, []);

  // Input validation
  const validateInputs = () => {
    const errors = {};
    
    // Email validation
    if (!email) {
      errors.email = ['Email is required'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = ['Please enter a valid email address'];
    }

    // Password validation - only check if password exists
    if (!password) {
      errors.password = ['Password is required'];
    }

    return errors;
  };

  // Store all token information with Safari compatibility
  const storeTokenInfo = (responseData) => {
    try {
      // Store main token
      if (responseData.token) {
        SafariStorage.setItem('token', responseData.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${responseData.token}`;
      }

      // Store refresh token if available
      if (responseData.refreshToken) {
        SafariStorage.setItem('refreshToken', responseData.refreshToken);
      }

      // Store token expiry if available
      if (responseData.expiresAt || responseData.expires_at || responseData.exp) {
        const expiryTime = responseData.expiresAt || responseData.expires_at || responseData.exp;
        SafariStorage.setItem('tokenExpiry', expiryTime);
      } else {
        // Set default expiry to 30 days from now if not provided
        const defaultExpiry = new Date();
        defaultExpiry.setDate(defaultExpiry.getDate() + 30);
        SafariStorage.setItem('tokenExpiry', defaultExpiry.toISOString());
      }

      // Store user information
      if (responseData.user) {
        SafariStorage.setItem('userInfo', JSON.stringify(responseData.user));
      }

      // Store any additional token metadata
      if (responseData.tokenType || responseData.token_type) {
        SafariStorage.setItem('tokenType', responseData.tokenType || responseData.token_type);
      }

      // Store permissions/roles if available
      if (responseData.permissions) {
        SafariStorage.setItem('userPermissions', JSON.stringify(responseData.permissions));
      }

      if (responseData.roles) {
        SafariStorage.setItem('userRoles', JSON.stringify(responseData.roles));
      }

      // Store session ID if available
      if (responseData.sessionId) {
        SafariStorage.setItem('sessionId', responseData.sessionId);
      }

      // Store last activity
      SafariStorage.setItem('lastActivity', Date.now().toString());

      console.log('Token info stored successfully for Safari compatibility');
    } catch (error) {
      console.error('Error storing token info:', error);
      throw new Error('Failed to store authentication data');
    }
  };

  // Handle login attempts and blocking
  const handleFailedLogin = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    SafariStorage.setItem('loginAttempts', newAttempts.toString());

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const blockEndTime = new Date().getTime() + BLOCK_DURATION;
      SafariStorage.setItem('loginBlockEndTime', blockEndTime.toString());
      setIsBlocked(true);
      setBlockTimeRemaining(Math.ceil(BLOCK_DURATION / 1000));
      setGeneralError(`Too many failed attempts. Please try again in ${Math.ceil(BLOCK_DURATION / 60000)} minutes.`);
    }
  };

  // Reset login attempts on successful login
  const handleSuccessfulLogin = () => {
    SafariStorage.removeItem('loginAttempts');
    SafariStorage.removeItem('loginBlockEndTime');
    setLoginAttempts(0);
    setIsBlocked(false);
  };

  const handleLogin = async () => {
    // Check if user is blocked
    if (isBlocked) {
      return;
    }

    // Check network connectivity
    if (!isOnline) {
      setGeneralError('No internet connection. Please check your network.');
      return;
    }

    setIsLoading(true);
    setGeneralError('');
    setFieldErrors({});
    setSessionExpired(false);

    // Client-side validation
    const validationErrors = validateInputs();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Enhanced request with Safari-specific headers
      const response = await axios.post('Authentication/login', {
        email: email.trim().toLowerCase(),
        password
      }, {
        timeout: 30000, // 30 second timeout for Safari
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      // Success handling
      console.log('Login successful:', response.data);
      
      // Store all token information with Safari compatibility
      storeTokenInfo(response.data);
      
      // Fetch user data using the same pattern as ProfilePage
      let firstName = 'User'; // Default fallback
      try {
        const userResponse = await axios.get('/Authentication/user', {
          timeout: 15000,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const userData = userResponse.data;
        
        // Use the exact same logic as ProfilePage for getting the name
        firstName = userData.firstname || userData.username || 'User';
        
        // Also store the user info with Safari compatibility
        SafariStorage.setItem('userInfo', JSON.stringify(userData));
      } catch (error) {
        console.warn('Could not fetch user data for welcome message:', error);
        
        // Try to get from stored userInfo as fallback
        const storedUserInfo = SafariStorage.getItem('userInfo');
        if (storedUserInfo) {
          try {
            const parsedUser = JSON.parse(storedUserInfo);
            firstName = parsedUser.firstname || parsedUser.username || 'User';
          } catch (parseError) {
            console.warn('Could not parse stored user info:', parseError);
          }
        }
        
        // Final fallback - use data from login response if available
        const fallbackData = response.data.user || response.data;
        if (fallbackData && firstName === 'User') {
          firstName = fallbackData.firstname || fallbackData.username || 'User';
        }
      }
      
      // Reset failed attempts
      handleSuccessfulLogin();

      // Add a small delay for Safari to process storage
      setTimeout(() => {
        navigate('/');
      }, 100);

    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        const { status, data } = err.response;

        switch (status) {
          case 400:
            // Bad Request - Validation errors
            if (data.errors) {
              setFieldErrors(data.errors);
            } else if (data.message) {
              setGeneralError(data.message);
            } else {
              setGeneralError('Invalid request. Please check your input.');
            }
            break;

          case 401:
            // Unauthorized - Invalid credentials
            setGeneralError(data.message || 'Invalid email or password.');
            handleFailedLogin();
            break;

          case 403:
            // Forbidden - Account locked, suspended, etc.
            setGeneralError(data.message || 'Account access denied. Please contact support.');
            break;

          case 404:
            // Not Found - Account doesn't exist
            setGeneralError('Account not found. Please check your email or create a new account.');
            break;

          case 409:
            // Conflict - Account needs verification, etc.
            setGeneralError(data.message || 'Account verification required. Please check your email.');
            break;

          case 422:
            // Unprocessable Entity - Validation errors
            if (data.errors) {
              setFieldErrors(data.errors);
            } else {
              setGeneralError(data.message || 'Invalid data provided.');
            }
            break;

          case 429:
            // Too Many Requests - Rate limiting
            setGeneralError(data.message || 'Too many requests. Please try again later.');
            break;

          case 500:
            // Internal Server Error
            setGeneralError('Server error. Please try again later.');
            break;

          case 502:
            // Bad Gateway
            setGeneralError('Service temporarily unavailable. Please try again later.');
            break;

          case 503:
            // Service Unavailable
            setGeneralError('Service is under maintenance. Please try again later.');
            break;

          case 504:
            // Gateway Timeout
            setGeneralError('Request timeout. Please try again.');
            break;

          default:
            // Any other HTTP error
            if (data?.message) {
              setGeneralError(data.message);
            } else {
              setGeneralError(`Unexpected error (${status}). Please try again.`);
            }
            break;
        }

      } else if (err.request) {
        // Network error - request was made but no response received
        if (err.code === 'ECONNABORTED') {
          setGeneralError('Request timeout. Please try again.');
        } else if (err.code === 'ERR_NETWORK') {
          setGeneralError('Network error. Please check your connection.');
        } else {
          setGeneralError('Unable to connect to server. Please try again.');
        }
      } else {
        // Something else happened
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format time remaining for display
  const formatTimeRemaining = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get error icon based on error type
  const getErrorIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (isBlocked) return <Shield className="w-4 h-4" />;
    if (sessionExpired) return <AlertTriangle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(to bottom right, ${theme.colors.gradientStart}, ${theme.colors.gradientMiddle}, ${theme.colors.gradientEnd})`
        }}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: theme.colors.orange }} />
          <p className="text-white">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: `linear-gradient(to bottom right, ${theme.colors.gradientStart}, ${theme.colors.gradientMiddle}, ${theme.colors.gradientEnd})`
      }}
    >
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.colors.orangeLight }}
          >
            <Lock className="w-7 h-7" style={{ color: theme.colors.orangeDark }} />
          </div>
          <h2 className="text-3xl font-semibold" style={{ color: theme.colors.textDark }}>
            Sign in 
          </h2>
          {SafariStorage.isSafari() && (
            <p className="text-xs text-gray-500 mt-2">Safari detected - Enhanced compatibility mode</p>
          )}
        </div>

        {/* Network Status Indicator */}
        {!isOnline && (
          <div className="mb-4 p-2 border rounded-xl flex items-center justify-center gap-2 bg-gray-50">
            <WifiOff className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Offline</span>
          </div>
        )}

        {/* General Error Display */}
        {generalError && (
          <div className="mb-4 p-3 border rounded-xl flex items-center gap-2" style={{ backgroundColor: theme.colors.errorLight, borderColor: theme.colors.error }}>
            {getErrorIcon()}
            <span className="text-sm" style={{ color: theme.colors.errorDark }}>
              {generalError}
            </span>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-5">
          <div>
            <label className="block text-sm mb-1" style={{ color: theme.colors.textDark }}>
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5" style={{ color: '#9CA3AF' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 border focus:outline-none focus:ring-2`}
                style={{
                  borderColor: fieldErrors.email ? theme.colors.error : '#D1D5DB',
                  outlineColor: theme.colors.orange,
                  ringColor: theme.colors.orange
                }}
                placeholder="you@example.com"
                required
                disabled={isLoading || isBlocked}
                autoComplete="email"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs mt-1" style={{ color: theme.colors.errorDark }}>
                {fieldErrors.email[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: theme.colors.textDark }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5" style={{ color: '#9CA3AF' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-100 border focus:outline-none focus:ring-2"
                style={{
                  borderColor: fieldErrors.password ? theme.colors.error : '#D1D5DB',
                  outlineColor: theme.colors.orange,
                  ringColor: theme.colors.orange
                }}
                placeholder="••••••••"
                required
                disabled={isLoading || isBlocked}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5"
                style={{ color: '#9CA3AF' }}
                disabled={isLoading || isBlocked}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs mt-1" style={{ color: theme.colors.errorDark }}>
                {fieldErrors.password[0]}
              </p>
            )}
          </div>

          <div className="flex justify-end text-sm">
            <button 
              type="button" 
              className="hover:underline" 
              style={{ color: theme.colors.orange }}
              disabled={isLoading || isBlocked}
              onClick={() => navigate('/forgot-password')}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || isBlocked || !isOnline}
            className="w-full py-3 font-semibold text-white rounded-xl transition duration-300 flex justify-center items-center gap-2"
            style={{
              background: `linear-gradient(to right, ${theme.colors.orange}, ${theme.colors.orangeDark})`,
              opacity: (isLoading || isBlocked || !isOnline) ? 0.5 : 1
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Logging in...
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
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: theme.colors.textGray }}>
          Don't have an account?
          <button
            onClick={() => navigate('/register')}
            className="ml-1 font-medium hover:underline"
            style={{ color: theme.colors.orange }}
            disabled={isLoading}
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;