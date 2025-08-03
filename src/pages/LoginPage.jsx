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

  // Check for existing valid session on component mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Set axios default header for authentication
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token is still valid by fetching user info
          const response = await axios.get('/Authentication/user');
          
          if (response.data) {
            // Token is valid, store user info and redirect
            localStorage.setItem('userInfo', JSON.stringify(response.data));
            navigate('/');
            return;
          }
        }
      } catch (error) {
        // Token is invalid or expired, clear stored data
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('userPermissions');
        localStorage.removeItem('userRoles');
        localStorage.removeItem('sessionId');
        delete axios.defaults.headers.common['Authorization'];
        
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
    const blockEndTime = localStorage.getItem('loginBlockEndTime');
    if (blockEndTime && new Date().getTime() < parseInt(blockEndTime)) {
      setIsBlocked(true);
      const remaining = parseInt(blockEndTime) - new Date().getTime();
      setBlockTimeRemaining(Math.ceil(remaining / 1000));
    }

    // Get current login attempts
    const attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
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
            localStorage.removeItem('loginBlockEndTime');
            localStorage.removeItem('loginAttempts');
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

  // Store all token information
  const storeTokenInfo = (responseData) => {
    // Store main token
    if (responseData.token) {
      localStorage.setItem('token', responseData.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${responseData.token}`;
    }

    // Store refresh token if available
    if (responseData.refreshToken) {
      localStorage.setItem('refreshToken', responseData.refreshToken);
    }

    // Store token expiry if available
    if (responseData.expiresAt || responseData.expires_at || responseData.exp) {
      const expiryTime = responseData.expiresAt || responseData.expires_at || responseData.exp;
      localStorage.setItem('tokenExpiry', expiryTime);
    }

    // Store user information
    if (responseData.user) {
      localStorage.setItem('userInfo', JSON.stringify(responseData.user));
    }

    // Store any additional token metadata
    if (responseData.tokenType || responseData.token_type) {
      localStorage.setItem('tokenType', responseData.tokenType || responseData.token_type);
    }

    // Store permissions/roles if available
    if (responseData.permissions) {
      localStorage.setItem('userPermissions', JSON.stringify(responseData.permissions));
    }

    if (responseData.roles) {
      localStorage.setItem('userRoles', JSON.stringify(responseData.roles));
    }

    // Store session ID if available
    if (responseData.sessionId) {
      localStorage.setItem('sessionId', responseData.sessionId);
    }
  };

  // Handle login attempts and blocking
  const handleFailedLogin = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    localStorage.setItem('loginAttempts', newAttempts.toString());

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const blockEndTime = new Date().getTime() + BLOCK_DURATION;
      localStorage.setItem('loginBlockEndTime', blockEndTime.toString());
      setIsBlocked(true);
      setBlockTimeRemaining(Math.ceil(BLOCK_DURATION / 1000));
      setGeneralError(`Too many failed attempts. Please try again in ${Math.ceil(BLOCK_DURATION / 60000)} minutes.`);
    }
  };

  // Reset login attempts on successful login
  const handleSuccessfulLogin = () => {
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('loginBlockEndTime');
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
      const response = await axios.post('Authentication/login', {
        email: email.trim().toLowerCase(),
        password
      });

      // Success handling
      
      // Store all token information
      storeTokenInfo(response.data);
      
      // Fetch user data using the same pattern as ProfilePage
      let firstName = 'User'; // Default fallback
      try {
        const userResponse = await axios.get('/Authentication/user');
        const userData = userResponse.data;
        
        // Use the exact same logic as ProfilePage for getting the name
        firstName = userData.firstname || userData.username || 'User';
        
        // Also store the user info in localStorage like ProfilePage does
        localStorage.setItem('userInfo', JSON.stringify(userData));
      } catch (error) {
        console.warn('Could not fetch user data for welcome message:', error);
        
        // Try to get from stored userInfo as fallback
        const storedUserInfo = localStorage.getItem('userInfo');
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

      // Redirect
      navigate('/');

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