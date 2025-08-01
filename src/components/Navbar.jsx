import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, User, LogOut, UserCircle, Clock, Menu, X, ShoppingCart, Home, BookOpen, Phone, History, ChevronDown, Heart } from 'lucide-react';
import theme from '../theme';
import toast from 'react-hot-toast';
import elephantLogo from '../assets/elephant-logo.svg';

const NAV_ITEMS = [
  { label: 'Home', to: '/', icon: <Home /> },
  { label: 'Menu', to: '/menu', icon: <BookOpen /> },
  { label: 'About', to: '/about', icon: <UserCircle /> },
  { label: 'Cart', to: '/cart', icon: <ShoppingCart /> },
];

const SESSION_CONFIG = {
  WARNING_TIME: 5 * 60 * 1000, 
  SESSION_DURATION: 30 * 60 * 1000, 
  CHECK_INTERVAL: 60 * 1000, 
};

const Navbar = ({ scrollY }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHoveringUser, setIsHoveringUser] = useState(false);
  const dropdownRef = useRef(null);
  const sessionCheckInterval = useRef(null);
  const sessionWarningTimeout = useRef(null);
  const sessionExpiryTimeout = useRef(null);

  const isSolid = typeof scrollY === 'number' ? scrollY > 50 : true;

  // User session management
  const getUserInfo = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  const user = getUserInfo();

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
      handleSessionExpiry();
      return false;
    }
    
    const timeLeft = SESSION_CONFIG.SESSION_DURATION - elapsed;
    setSessionTimeLeft(timeLeft);
    setIsSessionActive(true);
    
    if (timeLeft <= SESSION_CONFIG.WARNING_TIME && !showSessionWarning) {
      showSessionExpiryWarning();
    }
    
    return true;
  };

  const initializeSession = () => {
    const token = localStorage.getItem('token');
    if (token && !localStorage.getItem('sessionStart')) {
      localStorage.setItem('sessionStart', Date.now().toString());
    }
  };

  const showSessionExpiryWarning = () => {
    setShowSessionWarning(true);
    toast.error('Your session will expire soon. Please extend your session to continue.', {
      duration: 10000,
      position: 'top-center',
    });
  };

  const handleSessionExpiry = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionStart');
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
    localStorage.removeItem('rememberMe');
    
    clearInterval(sessionCheckInterval.current);
    clearTimeout(sessionWarningTimeout.current);
    clearTimeout(sessionExpiryTimeout.current);
    
    setIsSessionActive(false);
    setShowSessionWarning(false);
    setIsDropdownOpen(false);
    
    toast.error('Your session has expired. Please log in again.', {
      duration: 5000,
      position: 'top-center',
    });
    
    navigate('/login');
  };

  const extendSession = () => {
    localStorage.setItem('sessionStart', Date.now().toString());
    setShowSessionWarning(false);
    setSessionTimeLeft(SESSION_CONFIG.SESSION_DURATION);
    
    toast.success('Session extended successfully!', {
      duration: 3000,
    });
  };

  const endSession = () => {
    handleSessionExpiry();
    toast.success('Session ended successfully', {
      duration: 3000,
    });
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      initializeSession();
      checkSessionStatus();
      
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionStart');
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
    localStorage.removeItem('rememberMe');
    
    clearInterval(sessionCheckInterval.current);
    clearTimeout(sessionWarningTimeout.current);
    clearTimeout(sessionExpiryTimeout.current);
    
    setIsSessionActive(false);
    setShowSessionWarning(false);
    setIsDropdownOpen(false);
    
    toast.success('Logged out successfully');
    
    navigate('/');
  };

  const handleViewProfile = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  const handleHistory = () => {
    setIsDropdownOpen(false);
    navigate('/profile/history');
  };

  const handleFavourites = () => {
    setIsDropdownOpen(false);
    navigate('/profile/favorites');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isSolid ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-12 h-12 sm:w-14 sm:h-14 overflow-hidden rounded-full shadow-lg ring-2 ring-white/20 transition-transform duration-300 hover:scale-105">
              <img 
                src={elephantLogo} 
                alt="Elephant Logo" 
                className="object-cover w-full h-full" 
              />
            </div>
            <h1 
              className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide" 
              style={{ color: isSolid ? theme.colors.textDark : 'white' }}
            >
              FILA
            </h1>
          </div>

          {/* Desktop Navbar Links */}
          <div className="hidden md:flex space-x-6 lg:space-x-8">
            {NAV_ITEMS.map(({ label, to, icon }) => (
              <Link
                key={label}
                to={to}
                className="font-medium flex items-center gap-2 hover:scale-105 transition-all duration-300 px-2 py-1 rounded-lg hover:bg-white/10"
                style={{
                  color: isSolid ? theme.colors.textDark : 'white',
                  borderBottom: location.pathname === to ? `2px solid ${theme.colors.orange}` : '2px solid transparent'
                }}
              >
                <span className="w-5 h-5">{icon}</span>
                <span className="text-sm lg:text-base">{label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side - User Actions and Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Compact User Dropdown */}
            {isSessionActive ? (
              <div className="relative" ref={dropdownRef}>
                {/* User Button */}
                <div className="relative">
                  <button 
                    onClick={toggleDropdown}
                    onMouseEnter={() => setIsHoveringUser(true)}
                    onMouseLeave={() => setIsHoveringUser(false)}
                    className={`group relative flex items-center gap-2 px-3 py-2 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                      isDropdownOpen ? 'scale-105 shadow-2xl' : 'hover:scale-105'
                    }`}
                    style={{ 
                      background: isDropdownOpen || isHoveringUser 
                        ? `linear-gradient(135deg, ${theme.colors.gradientEnd}, ${theme.colors.gradientStart})` 
                        : `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})`
                    }}
                  >
                    {/* User Avatar Circle */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform duration-300 group-hover:scale-110" />
                      
                      {/* Animated Ring on Hover */}
                      <div className={`absolute inset-0 rounded-full border-2 border-white/40 transition-all duration-500 ${
                        isHoveringUser || isDropdownOpen ? 'scale-110 opacity-100' : 'scale-100 opacity-0'
                      }`} />
                    </div>

                    {/* User Name & Dropdown Arrow */}
                    <div className="hidden sm:flex items-center gap-2 text-white">
                      <div className="text-left">
                        <p className="text-sm font-semibold leading-tight">
                          {user?.name ? user.name.split(' ')[0] : 'User'}
                        </p>
                      </div>
                      
                      {/* Animated Chevron */}
                      <ChevronDown 
                        className={`w-4 h-4 transition-all duration-300 ${
                          isDropdownOpen ? 'rotate-180 scale-110' : 'rotate-0'
                        } ${isHoveringUser ? 'scale-110' : 'scale-100'}`}
                      />
                    </div>

                    {/* Mobile Chevron */}
                    <ChevronDown 
                      className={`sm:hidden w-4 h-4 text-white transition-all duration-300 ${
                        isDropdownOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    />

                    {/* Session Warning Indicator */}
                    {showSessionWarning && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg" />
                    )}
                  </button>
                </div>

                {/* Compact Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                    {/* Compact User Info Header */}
                    {user && (
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-sm">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: theme.colors.textDark }}>
                              {user.name || 'User'}
                            </p>
                            <p className="text-xs truncate" style={{ color: theme.colors.textGray }}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Compact Session Status */}
                    {sessionTimeLeft && (
                      <div className="px-4 py-3 border-b border-gray-100 bg-orange-50/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" style={{ color: theme.colors.orange }} />
                            <span className="text-xs font-medium" style={{ color: theme.colors.textDark }}>
                              Session
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold" style={{ color: theme.colors.orange }}>
                            {formatTime(sessionTimeLeft)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-400 to-orange-500 rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${Math.max(5, (sessionTimeLeft / SESSION_CONFIG.SESSION_DURATION) * 100)}%` 
                            }}
                          />
                        </div>
                        {showSessionWarning && (
                          <div className="flex gap-2 mt-2">
                            <button 
                              onClick={extendSession} 
                              className="flex-1 px-3 py-1.5 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition-all duration-200 font-medium"
                            >
                              Extend
                            </button>
                            <button 
                              onClick={endSession} 
                              className="flex-1 px-3 py-1.5 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200 font-medium"
                            >
                              End
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Compact Menu Options */}
                    <div className="py-1">
                      {/* View Profile */}
                      <button 
                        onClick={handleViewProfile} 
                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-blue-50 transition-all duration-200 group" 
                        style={{ color: theme.colors.textDark }}
                      >
                        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-all duration-200">
                          <UserCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">Profile</span>
                      </button>
                      
                      {/* History */}
                      <button 
                        onClick={handleHistory} 
                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-purple-50 transition-all duration-200 group" 
                        style={{ color: theme.colors.textDark }}
                      >
                        <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-all duration-200">
                          <History className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium">History</span>
                      </button>
                      
                      {/* Favourites */}
                      <button 
                        onClick={handleFavourites} 
                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 transition-all duration-200 group" 
                        style={{ color: theme.colors.textDark }}
                      >
                        <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-all duration-200">
                          <Heart className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-sm font-medium">Favourites</span>
                      </button>

                      {/* Divider */}
                      <div className="mx-4 my-2 border-t border-gray-100"></div>

                     

                      {/* Divider */}
                      <div className="mx-4 my-2 border-t border-gray-100"></div>

                     {/* Ultra Compact Logout Button */}
<button 
  onClick={handleLogout} 
  className="w-[90%] mx-auto mb-2 px-2.5 py-1.5 text-center flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-md transition-all duration-200 text-red-600 group"
>
  <LogOut className="w-3.5 h-3.5" />
  <span className="text-xs font-medium">Logout</span>
</button>

                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')} 
                className="px-6 py-2 sm:px-8 sm:py-2.5 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg text-base sm:text-lg" 
                style={{ background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})` }}
              >
                Login
              </button>
            )}

            {/* Mobile Hamburger Menu */}
            <button 
              className="block md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors" 
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" style={{ color: isSolid ? theme.colors.textDark : 'white' }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: isSolid ? theme.colors.textDark : 'white' }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg`}>
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map(({ label, to, icon }) => (
              <Link
                key={label}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  location.pathname === to 
                    ? 'bg-gray-100 shadow-sm' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ color: theme.colors.textDark }}
              >
                <span className="w-5 h-5 flex-shrink-0">{icon}</span>
                <span>{label}</span>
                {location.pathname === to && (
                  <div 
                    className="ml-auto w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme.colors.orange }}
                  />
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Session Warning Modal */}
      {showSessionWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6" style={{ color: theme.colors.orange }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg mb-1" style={{ color: theme.colors.textDark }}>
                  Session Expiring Soon
                </h3>
                <p className="text-sm" style={{ color: theme.colors.textGray }}>
                  Your session will expire in{' '}
                  <span className="font-mono font-semibold text-orange-600">
                    {sessionTimeLeft ? formatTime(sessionTimeLeft) : '0:00'}
                  </span>
                </p>
              </div>
            </div>
            
            <p className="text-sm mb-6 leading-relaxed" style={{ color: theme.colors.textGray }}>
              Would you like to extend your session to continue working, or end it now?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={extendSession} 
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg"
              >
                Extend Session
              </button>
              <button 
                onClick={endSession} 
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold text-sm shadow-md hover:shadow-lg"
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