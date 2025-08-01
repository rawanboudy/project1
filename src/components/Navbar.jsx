import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, User, LogOut, UserCircle, Menu, X, ShoppingCart, Home, BookOpen, Phone, History, ChevronDown, Heart } from 'lucide-react';
import theme from '../theme';
import toast from 'react-hot-toast';
import elephantLogo from '../assets/elephant-logo.svg';

const NAV_ITEMS = [
  { label: 'Home', to: '/', icon: <Home /> },
  { label: 'Menu', to: '/menu', icon: <BookOpen /> },
  { label: 'About', to: '/about', icon: <UserCircle /> },
  { label: 'Cart', to: '/cart', icon: <ShoppingCart /> },
];

const Navbar = ({ scrollY }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHoveringUser, setIsHoveringUser] = useState(false);
  const dropdownRef = useRef(null);

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
  const isLoggedIn = Boolean(localStorage.getItem('token'));

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
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
    localStorage.removeItem('rememberMe');
    
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
            {/* User Dropdown */}
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                {/* User Icon Button - Clean Design */}
                <div className="relative">
                  <button 
                    onClick={toggleDropdown}
                    onMouseEnter={() => setIsHoveringUser(true)}
                    onMouseLeave={() => setIsHoveringUser(false)}
                    className={`group relative flex items-center gap-2 p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                      isDropdownOpen ? 'scale-110' : ''
                    }`}
                  >
                    {/* Orange User Avatar Circle - Larger Size */}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isHoveringUser || isDropdownOpen 
                        ? 'bg-gradient-to-br from-orange-600 to-orange-400 shadow-lg scale-105' 
                        : 'bg-gradient-to-br from-orange-500 to-orange-400'
                    }`}>
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>

                    {/* Desktop: User Name & Dropdown Arrow */}
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="text-left">
                        <p className={`text-sm font-semibold leading-tight transition-colors duration-300 ${
                          isSolid ? 'text-gray-800' : 'text-white'
                        }`}>
                          {user?.name ? user.name.split(' ')[0] : 'User'}
                        </p>
                      </div>
                      
                      {/* Animated Chevron */}
                      <ChevronDown 
                        className={`w-4 h-4 transition-all duration-300 ${
                          isDropdownOpen ? 'rotate-180 scale-110' : 'rotate-0'
                        } ${isHoveringUser ? 'scale-110' : 'scale-100'} ${
                          isSolid ? 'text-gray-600' : 'text-white'
                        }`}
                      />
                    </div>

                    {/* Mobile: Small Arrow Indicator */}
                    <ChevronDown 
                      className={`sm:hidden w-3 h-3 transition-all duration-300 ${
                        isDropdownOpen ? 'rotate-180 scale-110' : 'rotate-0'
                      } ${isHoveringUser || isDropdownOpen ? 'scale-110' : 'scale-100'} ${
                        isSolid ? 'text-orange-500' : 'text-white'
                      }`}
                    />
                  </button>
                </div>

                {/* Desktop Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="hidden sm:block absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
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

                    {/* Menu Options */}
                    <div className="py-1">
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

                      <div className="mx-4 my-2 border-t border-gray-100"></div>

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

                {/* Mobile Dropdown Menu - Simple List */}
                {isDropdownOpen && (
                  <div className="sm:hidden absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                    {/* Mobile User Header */}
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

                    {/* Navigation Items for Mobile */}
                    <div className="py-1">
                      {NAV_ITEMS.map(({ label, to, icon }) => (
                        <Link
                          key={label}
                          to={to}
                          onClick={() => setIsDropdownOpen(false)}
                          className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-200 ${
                            location.pathname === to 
                              ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500' 
                              : 'hover:bg-orange-50 text-gray-700 hover:text-orange-600'
                          }`}
                        >
                          <span className={`w-5 h-5 transition-colors duration-200 ${
                            location.pathname === to ? 'text-orange-500' : 'text-gray-500'
                          }`}>
                            {icon}
                          </span>
                          <span className="text-sm font-medium">{label}</span>
                          {location.pathname === to && (
                            <div className="ml-auto w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                          )}
                        </Link>
                      ))}

                      <div className="mx-4 my-2 border-t border-gray-100"></div>

                      {/* User Actions - All with same orange hover style */}
                      <button 
                        onClick={handleViewProfile} 
                        className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-200 ${
                          location.pathname === '/profile'
                            ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500'
                            : 'hover:bg-orange-50 text-gray-700 hover:text-orange-600'
                        }`}
                      >
                        <UserCircle className={`w-5 h-5 transition-colors duration-200 ${
                          location.pathname === '/profile' ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'
                        }`} />
                        <span className="text-sm font-medium">Profile</span>
                        {location.pathname === '/profile' && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        )}
                      </button>
                      
                      <button 
                        onClick={handleHistory} 
                        className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-200 ${
                          location.pathname === '/profile/history'
                            ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500'
                            : 'hover:bg-orange-50 text-gray-700 hover:text-orange-600'
                        }`}
                      >
                        <History className={`w-5 h-5 transition-colors duration-200 ${
                          location.pathname === '/profile/history' ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'
                        }`} />
                        <span className="text-sm font-medium">History</span>
                        {location.pathname === '/profile/history' && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        )}
                      </button>
                      
                      <button 
                        onClick={handleFavourites} 
                        className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all duration-200 ${
                          location.pathname === '/profile/favorites'
                            ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500'
                            : 'hover:bg-orange-50 text-gray-700 hover:text-orange-600'
                        }`}
                      >
                        <Heart className={`w-5 h-5 transition-colors duration-200 ${
                          location.pathname === '/profile/favorites' ? 'text-orange-600' : 'text-gray-500 hover:text-orange-500'
                        }`} />
                        <span className="text-sm font-medium">Favourites</span>
                        {location.pathname === '/profile/favorites' && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        )}
                      </button>

                      <div className="mx-4 my-2 border-t border-gray-100"></div>

                      <button 
                        onClick={handleLogout} 
                        className="w-[90%] mx-auto mb-2 px-3 py-2 text-center flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-md transition-all duration-200 text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
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

            {/* Mobile Hamburger Menu (only shown when not logged in) */}
            {!isLoggedIn && (
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
            )}
          </div>
        </div>

        {/* Mobile Menu (only for non-logged in users) */}
        {!isLoggedIn && (
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
        )}
      </nav>
    </>
  );
};

export default Navbar;