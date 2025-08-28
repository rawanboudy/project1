// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User, LogOut, UserCircle, ShoppingCart, Home, BookOpen,
  History, ChevronDown, Heart, Moon, Sun, Menu, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import elephantLogo from '../assets/elephant-logo.svg';
import { useTheme } from '../theme/ThemeProvider';

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
  const [isHoveringUser, setIsHoveringUser] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isSolid = typeof scrollY === 'number' ? scrollY > 50 : true;

  // Theme (light/dark)
  const { theme: mode, toggleTheme } = useTheme();

  // Helpers
  const getUserInfo = () => {
    try {
      let userStr = localStorage.getItem('userInfo');
      if (userStr) return JSON.parse(userStr);
      userStr = localStorage.getItem('user');
      if (userStr) return JSON.parse(userStr);
      return null;
    } catch {
      return null;
    }
  };

  const checkLoginStatus = () => Boolean(localStorage.getItem('token'));

  const updateUserState = () => {
    const userInfo = getUserInfo();
    const loginStatus = checkLoginStatus();
    setUser(userInfo);
    setIsLoggedIn(loginStatus);
    if (!loginStatus) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    updateUserState();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        updateUserState();
      } else if (e.key === 'user' || e.key === 'userInfo') {
        const userInfo = getUserInfo();
        setUser(userInfo);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const handleCustomStorageChange = () => {
      updateUserState();
    };
    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayUsername = () => {
    const src = user || getUserInfo();
    if (!src) return 'User';
    if (src.firstname && src.lastname) return `${src.firstname} ${src.lastname}`;
    if (src.firstname) return src.firstname;
    if (src.username) return src.username;
    if (src.email) return src.email.split('@')[0];
    return 'User';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('userPermissions');
    localStorage.removeItem('userRoles');
    localStorage.removeItem('sessionId');
    delete window.axios?.defaults?.headers?.common['Authorization'];

    window.dispatchEvent(new Event('localStorageChange'));
    setUser(null);
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    setMobileOpen(false);

    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleViewProfile = () => {
    setIsDropdownOpen(false);
    setMobileOpen(false);
    navigate('/profile');
  };
  const handleHistory = () => {
    setIsDropdownOpen(false);
    setMobileOpen(false);
    navigate('/profile/history');
  };
  const handleFavourites = () => {
    setIsDropdownOpen(false);
    setMobileOpen(false);
    navigate('/profile/favorites');
  };

  // Shared icon color classes (consistent orange, dark-mode aware)
  const iconColor = 'text-orange-600 dark:text-orange-400';

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 
        ${isSolid
          ? 'bg-white/95 dark:bg-gray-900/90 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-12 h-12 sm:w-14 sm:h-14 overflow-hidden rounded-full shadow-lg ring-2 ring-white/20 dark:ring-gray-700 transition-transform duration-300 hover:scale-105">
            <img src={elephantLogo} alt="Elephant Logo" className="object-cover w-full h-full" />
          </div>
          <h1
            className={`text-lg sm:text-xl md:text-2xl font-bold tracking-wide transition-colors 
              ${isSolid ? 'text-gray-900 dark:text-gray-100' : 'text-gray-900 dark:text-white'}`}
          >
            FILA
          </h1>
        </div>

        {/* Center: Desktop Nav */}
        <div className="hidden md:flex space-x-6 lg:space-x-8">
          {NAV_ITEMS.map(({ label, to, icon }) => (
            <Link
              key={label}
              to={to}
              className={`font-medium flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-300 hover:scale-105
                ${location.pathname === to
                  ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400'
                  : isSolid
                    ? 'text-gray-800 dark:text-gray-200 hover:bg-gray-100/30 dark:hover:bg-gray-800/50'
                    : 'text-gray-900 dark:text-white hover:bg-gray-100/40 dark:hover:bg-white/10'}`}
            >
              <span className={`w-5 h-5 ${iconColor}`}>{icon}</span>
              <span className="text-sm lg:text-base">{label}</span>
            </Link>
          ))}
        </div>

        {/* Right: Theme + User / Login + Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`group relative p-2 rounded-full border transition-all
              hover:scale-110 focus:outline-none focus:ring-2
              focus:ring-orange-400 focus:ring-offset-2 dark:focus:ring-orange-500
              ${isSolid
                ? 'border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800'
                : 'border-gray-300 text-gray-900 hover:bg-gray-100/60 dark:border-gray-700 dark:text-white dark:hover:bg-white/10'}`}
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-400/40 to-pink-500/40 opacity-0 group-hover:opacity-100 blur-md transition" />
            {mode === 'dark'
              ? <Sun className={`w-5 h-5 ${iconColor}`} />
              : <Moon className={`w-5 h-5 ${iconColor}`} />}
          </button>

          {/* Desktop: User / Login */}
          <div className="hidden md:block">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  onMouseEnter={() => setIsHoveringUser(true)}
                  onMouseLeave={() => setIsHoveringUser(false)}
                  className="group relative flex items-center gap-2 p-2 rounded-full transition-all duration-300 hover:scale-110"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center 
                    ${isHoveringUser || isDropdownOpen
                      ? 'bg-gradient-to-br from-orange-600 to-orange-400 shadow-lg'
                      : 'bg-gradient-to-br from-orange-500 to-orange-400'
                    }`}>
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <p className={`hidden sm:block text-sm font-semibold truncate max-w-24 transition-colors
                      ${isSolid ? 'text-gray-800 dark:text-gray-100' : 'text-gray-900 dark:text-white'}`}>
                      {getDisplayUsername()}
                    </p>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${iconColor}
                        ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                    />
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
                    {user && (
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {getDisplayUsername().charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-gray-800 dark:text-gray-100">
                              {getDisplayUsername()}
                            </p>
                            <p className="text-xs truncate text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="py-1">
                      <button
                        onClick={handleViewProfile}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                      >
                        <UserCircle className={`w-4 h-4 ${iconColor}`} />
                        Profile
                      </button>
                      <button
                        onClick={handleHistory}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                      >
                        <History className={`w-4 h-4 ${iconColor}`} />
                        History
                      </button>
                      <button
                        onClick={handleFavourites}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                      >
                        <Heart className={`w-4 h-4 ${iconColor}`} />
                        Favourites
                      </button>
                      <div className="mx-4 my-2 border-t border-gray-200 dark:border-gray-700"></div>
                      <button
                        onClick={handleLogout}
                        className="w-[90%] mx-auto mb-2 px-2.5 py-1.5 flex items-center justify-center gap-1.5 
                          bg-red-50 dark:bg-red-900/40 hover:bg-red-100 dark:hover:bg-red-800/60 
                          border border-red-200 dark:border-red-700 text-red-600 rounded-md"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className={`w-6 h-6 ${iconColor}`} /> : <Menu className={`w-6 h-6 ${iconColor}`} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />
        {/* Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-[85%] bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-100 dark:border-gray-800 transform transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img src={elephantLogo} alt="Elephant Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">FILA</span>
            </div>
            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className={`w-5 h-5 ${iconColor}`} />
            </button>
          </div>

          {/* Drawer Content (scrollable) */}
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Profile block FIRST */}
              {isLoggedIn && (
                <>
                  <div className="flex items-center gap-3 px-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center text-white font-bold">
                      {getDisplayUsername().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {getDisplayUsername()}
                      </p>
                      {user?.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={handleViewProfile}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <UserCircle className={`w-5 h-5 ${iconColor}`} />
                      Profile
                    </button>
                    <button
                      onClick={handleHistory}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <History className={`w-5 h-5 ${iconColor}`} />
                      History
                    </button>
                    <button
                      onClick={handleFavourites}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Heart className={`w-5 h-5 ${iconColor}`} />
                      Favourites
                    </button>
                  </div>

                  <div className="my-3 border-t border-gray-200 dark:border-gray-800" />
                </>
              )}

              {/* Then the main nav links */}
              {NAV_ITEMS.map(({ label, to, icon }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition
                    ${location.pathname === to
                      ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'
                      : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <span className={`w-5 h-5 ${iconColor}`}>{icon}</span>
                  <span className="text-base">{label}</span>
                </Link>
              ))}

              {/* If not logged in, put Login button in the content section */}
              {!isLoggedIn && (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/login');
                  }}
                  className="w-full mt-2 px-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition"
                >
                  Login
                </button>
              )}

              {/* >>> Logout AT THE END of the mobile menu <<< */}
              {isLoggedIn && (
                <>
                  <div className="my-3 border-t border-gray-200 dark:border-gray-800" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-800/60 border border-red-200 dark:border-red-800 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
