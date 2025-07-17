// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, User, LogOut, UserCircle, Clock, X } from 'lucide-react';
import theme from '../theme';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Home',    to: '/'       },
  { label: 'Menu',    to: '/menu'   },
  { label: 'About',   to: '/about'  },
  { label: 'Cart',    to: '/cart'   },
  { label: 'Contact', to: '/contact'}
];

// Session configuration
const SESSION_CONFIG = {
  WARNING_TIME: 5 * 60 * 1000, // 5 minutes before expiry
  SESSION_DURATION: 30 * 60 * 1000, // 30 minutes total
  CHECK_INTERVAL: 60 * 1000, // Check every minute
};

const Navbar = ({ scrollY }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  const dropdownRef = useRef(null);
  const sessionCheckInterval = useRef(null);
  const sessionWarningTimeout = useRef(null);
  const sessionExpiryTimeout = useRef(null);
  
  const isSolid = typeof scrollY === 'number' ? scrollY > 50 : true;

  // Get user info from localStorage if available
  const getUserInfo = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  const user = getUserInfo();

  // Check if session is active
  const checkSessionStatus = () => {
    const token = localStorage.getItem('token');
    const sessionStart = localStorage.getItem('sessionStart');
    
    if (!token || !sessionStart) {
      setIsSessionActive(false);
      return false;
    }

    const now = Date.now();
    const startTime = parseInt(sessionStart);
    const elapsed = now - startTime;
    
    if (elapsed >= SESSION_CONFIG.SESSION_DURATION) {
      // Session expired
      handleSessionExpiry();
      return false;
    }
    
    const timeLeft = SESSION_CONFIG.SESSION_DURATION - elapsed;
    setSessionTimeLeft(timeLeft);
    setIsSessionActive(true);
    
    // Show warning if close to expiry
    if (timeLeft <= SESSION_CONFIG.WARNING_TIME && !showSessionWarning) {
      showSessionExpiryWarning();
    }
    
    return true;
  };

  // Initialize session tracking
  const initializeSession = () => {
    const token = localStorage.getItem('token');
    if (token && !localStorage.getItem('sessionStart')) {
      localStorage.setItem('sessionStart', Date.now().toString());
    }
  };

  // Show session expiry warning
  const showSessionExpiryWarning = () => {
    setShowSessionWarning(true);
    toast.error('Your session will expire soon. Please extend your session to continue.', {
      duration: 10000,
      position: 'top-center',
    });
  };

  // Handle session expiry
  const handleSessionExpiry = () => {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionStart');
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
    localStorage.removeItem('rememberMe');
    
    // Clear intervals and timeouts
    clearInterval(sessionCheckInterval.current);
    clearTimeout(sessionWarningTimeout.current);
    clearTimeout(sessionExpiryTimeout.current);
    
    // Update state
    setIsSessionActive(false);
    setShowSessionWarning(false);
    setIsDropdownOpen(false);
    
    // Show expiry message
    toast.error('Your session has expired. Please log in again.', {
      duration: 5000,
      position: 'top-center',
    });
    
    // Navigate to login
    navigate('/login');
  };

  // Extend session
  const extendSession = () => {
    localStorage.setItem('sessionStart', Date.now().toString());
    setShowSessionWarning(false);
    setSessionTimeLeft(SESSION_CONFIG.SESSION_DURATION);
    
    toast.success('Session extended successfully!', {
      duration: 3000,
    });
  };

  // End session manually
  const endSession = () => {
    handleSessionExpiry();
    toast.success('Session ended successfully', {
      duration: 3000,
    });
  };

  // Format time for display
  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Setup session monitoring
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      initializeSession();
      checkSessionStatus();
      
      // Set up periodic session checks
      sessionCheckInterval.current = setInterval(() => {
        checkSessionStatus();
      }, SESSION_CONFIG.CHECK_INTERVAL);
    }

    return () => {
      clearInterval(sessionCheckInterval.current);
      clearTimeout(sessionWarningTimeout.current);
      clearTimeout(sessionExpiryTimeout.current);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionStart');
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
    localStorage.removeItem('rememberMe');
    
    // Clear intervals and timeouts
    clearInterval(sessionCheckInterval.current);
    clearTimeout(sessionWarningTimeout.current);
    clearTimeout(sessionExpiryTimeout.current);
    
    // Update state
    setIsSessionActive(false);
    setShowSessionWarning(false);
    setIsDropdownOpen(false);
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Navigate to home or login page
    navigate('/');
  };

  const handleViewProfile = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <>
      <nav className={`
          fixed top-0 w-full z-50 transition-all duration-500
          ${isSolid
            ? 'bg-white/95 backdrop-blur-md shadow-lg'
            : 'bg-transparent'}
        `}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})`
              }}
            >
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ color: isSolid ? theme.colors.textDark : 'white' }}
            >
              Savoria
            </h1>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex space-x-8">
            {NAV_ITEMS.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="font-medium hover:scale-105 transition-all duration-300"
                style={{
                  color: isSolid ? theme.colors.textDark : 'white',
                  borderBottom: location.pathname === to
                    ? `2px solid ${theme.colors.orange}`
                    : '2px solid transparent'
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Login or User Dropdown */}
          {isSessionActive ? (
            <div className="relative" ref={dropdownRef}>
              {/* User Button with session indicator */}
              <button
                onClick={toggleDropdown}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 relative"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})`
                }}
              >
                <User className="w-5 h-5 text-white" />
                {/* Session warning indicator */}
                {showSessionWarning && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border overflow-hidden"
                  style={{
                    borderColor: theme.colors.orange + '20',
                    boxShadow: `0 10px 25px -5px ${theme.colors.orange}20, 0 10px 10px -5px ${theme.colors.orange}10`
                  }}
                >
                  {/* User Info Header */}
                  {user && (
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium" style={{ color: theme.colors.textDark }}>
                        {user.name || user.email}
                      </p>
                      <p className="text-xs" style={{ color: theme.colors.textGray }}>
                        {user.email}
                      </p>
                    </div>
                  )}

                  {/* Session Status */}
                  {sessionTimeLeft && (
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-3 h-3" style={{ color: theme.colors.orange }} />
                        <span style={{ color: theme.colors.textGray }}>
                          Session expires in: {formatTime(sessionTimeLeft)}
                        </span>
                      </div>
                      {showSessionWarning && (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={extendSession}
                            className="flex-1 px-3 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                          >
                            Extend
                          </button>
                          <button
                            onClick={endSession}
                            className="flex-1 px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                          >
                            End Now
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={handleViewProfile}
                      className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors duration-200"
                      style={{ color: theme.colors.textDark }}
                    >
                      <UserCircle className="w-4 h-4" />
                      <span className="text-sm">View Profile</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-red-50 transition-colors duration-200 text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 rounded-full font-medium text-white transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})`
              }}
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Session Warning Modal */}
      {showSessionWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6" style={{ color: theme.colors.orange }} />
              </div>
              <div>
                <h3 className="font-semibold text-lg" style={{ color: theme.colors.textDark }}>
                  Session Expiring Soon
                </h3>
                <p className="text-sm" style={{ color: theme.colors.textGray }}>
                  Your session will expire in {sessionTimeLeft ? formatTime(sessionTimeLeft) : '0:00'}
                </p>
              </div>
            </div>
            
            <p className="text-sm mb-6" style={{ color: theme.colors.textGray }}>
              Would you like to extend your session or end it now?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={extendSession}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Extend Session
              </button>
              <button
                onClick={endSession}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;