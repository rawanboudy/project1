import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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

  const MAX_LOGIN_ATTEMPTS = 5;
  const BLOCK_DURATION = 300000; // 5m

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('/Authentication/user');
          if (response.data) {
            localStorage.setItem('userInfo', JSON.stringify(response.data));
            navigate('/');
            return;
          }
        }
      } catch (error) {
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

  useEffect(() => {
    const sessionExpiredFlag = sessionStorage.getItem('sessionExpired');
    if (sessionExpiredFlag === 'true') {
      setSessionExpired(true);
      setGeneralError('Your session has expired. Please log in again.');
      sessionStorage.removeItem('sessionExpired');
    }
    const blockEndTime = localStorage.getItem('loginBlockEndTime');
    if (blockEndTime && new Date().getTime() < parseInt(blockEndTime)) {
      setIsBlocked(true);
      const remaining = parseInt(blockEndTime) - new Date().getTime();
      setBlockTimeRemaining(Math.ceil(remaining / 1000));
    }
    const attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    setLoginAttempts(attempts);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (generalError === 'No internet connection. Please check your network.') setGeneralError('');
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

  const validateInputs = () => {
    const errors = {};
    if (!email) errors.email = ['Email is required'];
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ['Please enter a valid email address'];
    if (!password) errors.password = ['Password is required'];
    return errors;
  };

  const storeTokenInfo = (data) => {
    if (data.token) {
      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    if (data.expiresAt || data.expires_at || data.exp) {
      localStorage.setItem('tokenExpiry', data.expiresAt || data.expires_at || data.exp);
    }
    if (data.user) localStorage.setItem('userInfo', JSON.stringify(data.user));
    if (data.tokenType || data.token_type) localStorage.setItem('tokenType', data.tokenType || data.token_type);
    if (data.permissions) localStorage.setItem('userPermissions', JSON.stringify(data.permissions));
    if (data.roles) localStorage.setItem('userRoles', JSON.stringify(data.roles));
    if (data.sessionId) localStorage.setItem('sessionId', data.sessionId);
  };

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

  const handleSuccessfulLogin = () => {
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('loginBlockEndTime');
    setLoginAttempts(0);
    setIsBlocked(false);
  };

  const handleLogin = async () => {
    if (isBlocked) return;
    if (!isOnline) {
      setGeneralError('No internet connection. Please check your network.');
      return;
    }
    setIsLoading(true);
    setGeneralError('');
    setFieldErrors({});
    setSessionExpired(false);

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

      storeTokenInfo(response.data);

      let firstName = 'User';
      try {
        const userResponse = await axios.get('/Authentication/user');
        const userData = userResponse.data;
        firstName = userData.firstname || userData.username || 'User';
        localStorage.setItem('userInfo', JSON.stringify(userData));
      } catch (err) {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          try {
            const parsed = JSON.parse(storedUserInfo);
            firstName = parsed.firstname || parsed.username || 'User';
          } catch {}
        } else {
          const fallback = response.data.user || response.data;
          if (fallback && firstName === 'User') firstName = fallback.firstname || fallback.username || 'User';
        }
      }

      handleSuccessfulLogin();
      toast.success(`Welcome back, ${firstName}!`);
      navigate('/');
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        switch (status) {
          case 400:
            if (data.errors) setFieldErrors(data.errors);
            else setGeneralError(data.message || 'Invalid request. Please check your input.');
            break;
          case 401:
            setGeneralError(data.message || 'Invalid email or password.');
            handleFailedLogin();
            break;
          case 403:
            setGeneralError(data.message || 'Account access denied. Please contact support.');
            break;
          case 404:
            setGeneralError('Account not found. Please check your email or create a new account.');
            break;
          case 409:
            setGeneralError(data.message || 'Account verification required. Please check your email.');
            break;
          case 422:
            if (data.errors) setFieldErrors(data.errors);
            else setGeneralError(data.message || 'Invalid data provided.');
            break;
          case 429:
            setGeneralError(data.message || 'Too many requests. Please try again later.');
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
          case 504:
            setGeneralError('Request timeout. Please try again.');
            break;
          default:
            setGeneralError(data?.message || `Unexpected error (${status}). Please try again.`);
            break;
        }
      } else if (err.request) {
        if (err.code === 'ECONNABORTED') setGeneralError('Request timeout. Please try again.');
        else if (err.code === 'ERR_NETWORK') setGeneralError('Network error. Please check your connection.');
        else setGeneralError('Unable to connect to server. Please try again.');
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeRemaining = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getErrorIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (isBlocked) return <Shield className="w-4 h-4" />;
    if (sessionExpired) return <AlertTriangle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 dark:from-gray-900 dark:via-gray-950 dark:to-black">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white/90">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 dark:from-gray-900 dark:via-gray-950 dark:to-black">
      <div className="w-full max-w-md rounded-3xl p-8 shadow-2xl bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-orange-100 dark:bg-gray-800">
            <Lock className="w-7 h-7 text-orange-600" />
          </div>
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
            Sign in
          </h2>
        </div>

        {!isOnline && (
          <div className="mb-4 p-2 rounded-xl flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm">Offline</span>
          </div>
        )}

        {generalError && (
          <div className="mb-4 p-3 rounded-xl flex items-center gap-2 border bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
            {getErrorIcon()}
            <span className="text-sm">{generalError}</span>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-5">
          <div>
            <label className="block text-sm mb-1 text-gray-800 dark:text-gray-200">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 
                ${fieldErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-700 focus:ring-orange-400 dark:focus:ring-orange-500'}`}
                placeholder="you@example.com"
                required
                disabled={isLoading || isBlocked}
                autoComplete="email"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs mt-1 text-red-600 dark:text-red-400">
                {fieldErrors.email[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-800 dark:text-gray-200">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 
                ${fieldErrors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-gray-700 focus:ring-orange-400 dark:focus:ring-orange-500'}`}
                placeholder="••••••••"
                required
                disabled={isLoading || isBlocked}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                disabled={isLoading || isBlocked}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs mt-1 text-red-600 dark:text-red-400">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>

          <div className="flex justify-end text-sm">
            <button
              type="button"
              className="hover:underline text-orange-600 dark:text-orange-400"
              disabled={isLoading || isBlocked}
              onClick={() => navigate('/forgot-password')}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || isBlocked || !isOnline}
            className="w-full py-3 font-semibold text-white rounded-xl transition duration-300 flex justify-center items-center gap-2 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
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

        <p className="text-center text-sm mt-6 text-gray-600 dark:text-gray-400">
          Don't have an account?
          <button
            onClick={() => navigate('/register')}
            className="ml-1 font-medium hover:underline text-orange-600 dark:text-orange-400"
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
