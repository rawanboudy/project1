import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, User, LogOut, UserCircle, Clock, Menu, X, ShoppingCart, Home, BookOpen, Phone } from 'lucide-react';
import theme from '../theme';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Home', to: '/', icon: <Home /> },
  { label: 'Menu', to: '/menu', icon: <BookOpen /> },
  { label: 'About', to: '/about', icon: <UserCircle /> },
  { label: 'Cart', to: '/cart', icon: <ShoppingCart /> },
  { label: 'Contact', to: '/contact', icon: <Phone /> }
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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isSolid ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})` }}>
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: isSolid ? theme.colors.textDark : 'white' }}>Savoria</h1>
          </div>

          {/* Mobile Hamburger Menu */}
          <button className="block md:hidden" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X className="w-6 h-6" style={{ color: isSolid ? theme.colors.textDark : 'white' }} /> : <Menu className="w-6 h-6" style={{ color: isSolid ? theme.colors.textDark : 'white' }} />}
          </button>

          {/* Desktop Navbar Links */}
          <div className="hidden md:flex space-x-8">
            {NAV_ITEMS.map(({ label, to, icon }) => (
              <Link
                key={label}
                to={to}
                className="font-medium flex items-center gap-2 hover:scale-105 transition-all duration-300"
                style={{
                  color: isSolid ? theme.colors.textDark : 'white',
                  borderBottom: location.pathname === to ? `2px solid ${theme.colors.orange}` : '2px solid transparent'
                }}
              >
                {icon}
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* User Dropdown */}
          {isSessionActive ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={toggleDropdown} className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 relative" style={{ background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})` }}>
                <User className="w-5 h-5 text-white" />
                {showSessionWarning && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border overflow-hidden">
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

                  {sessionTimeLeft && (
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-3 h-3" style={{ color: theme.colors.orange }} />
                        <span style={{ color: theme.colors.textGray }}>Session expires in: {formatTime(sessionTimeLeft)}</span>
                      </div>
                      {showSessionWarning && (
                        <div className="mt-2 flex gap-2">
                          <button onClick={extendSession} className="flex-1 px-3 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">Extend</button>
                          <button onClick={endSession} className="flex-1 px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">End Now</button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="py-2">
                    <button onClick={handleViewProfile} className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors duration-200" style={{ color: theme.colors.textDark }}>
                      <UserCircle className="w-4 h-4" />
                      <span className="text-sm">View Profile</span>
                    </button>
                    
                    <button onClick={handleLogout} className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-red-50 transition-colors duration-200 text-red-600">
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="px-6 py-2 rounded-full font-medium text-white transition-all duration-300 hover:scale-105" style={{ background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})` }}>
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu - Professional Sliding Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden bg-white/95 backdrop-blur-md border-t border-gray-100`}>
          <div className="px-4 py-4 space-y-1">
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
                style={{
                  color: theme.colors.textDark,
                }}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6" style={{ color: theme.colors.orange }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg mb-1" style={{ color: theme.colors.textDark }}>
                  Session Expiring Soon
                </h3>
                <p className="text-sm" style={{ color: theme.colors.textGray }}>
                  Your session will expire in <span className="font-semibold">{sessionTimeLeft ? formatTime(sessionTimeLeft) : '0:00'}</span>
                </p>
              </div>
            </div>
            
            <p className="text-sm mb-6 leading-relaxed" style={{ color: theme.colors.textGray }}>
              Would you like to extend your session to continue working, or end it now?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={extendSession} 
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold text-sm"
              >
                Extend Session
              </button>
              <button 
                onClick={endSession} 
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold text-sm"
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