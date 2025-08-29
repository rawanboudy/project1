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

// Desktop center-nav (Cart is moved to the right cluster on desktop)
const NAV_ITEMS = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Menu', to: '/menu', icon: BookOpen },
  { label: 'About', to: '/about', icon: UserCircle },
  { label: 'Cart', to: '/cart', icon: ShoppingCart },

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
  const drawerRef = useRef(null); // focus-trap container

  // Solid header after a small scroll
  const isSolid = typeof scrollY === 'number' ? scrollY > 50 : true;

  // Theme
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
    if (!loginStatus) setIsDropdownOpen(false);
  };

  useEffect(() => {
    updateUserState();
  }, []);

  // React to storage changes (multi-tab + same-tab custom)
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

    const handleCustomStorageChange = () => updateUserState();
    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsDropdownOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  // Close mobile drawer on Escape, and trap focus inside when open
  useEffect(() => {
    if (!mobileOpen) return;

    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);

    // Focus trap
    const node = drawerRef.current;
    if (node) {
      const focusable = node.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      const handleTab = (e) => {
        if (e.key !== 'Tab') return;
        if (focusable.length === 0) return;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      };

      document.addEventListener('keydown', handleTab);
      first?.focus();

      return () => {
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('keydown', handleTab);
      };
    }

    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

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
    delete window.axios?.defaults?.headers?.common?.Authorization;

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

  // Dynamic color classes based on solid state and theme
  const getTextColor = () => {
    if (isSolid) {
      return 'text-gray-800 dark:text-white';
    }
    return 'text-white';
  };

  const getIconColor = () => {
    if (isSolid) {
      return 'text-orange-600 dark:text-orange-400';
    }
    return 'text-white';
  };

  const getNavLinkColor = (isActive) => {
    if (isActive) {
      if (isSolid) {
        return 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400';
      }
      return 'border-b-2 border-orange-400 text-orange-200';
    }
    if (isSolid) {
      return 'text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400';
    }
    return 'text-white hover:text-orange-200';
  };

  const getUsernameColor = () => {
    if (isSolid) {
      return 'text-gray-800 dark:text-gray-100';
    }
    return 'text-white';
  };

  return (
    <nav
      className={`fixed top-0 w-full z-[70] transition-all duration-500 
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
          <h1 className={`text-lg sm:text-xl md:text-2xl font-bold tracking-wide transition-colors duration-300 ${getTextColor()}`}>
            FILA
          </h1>
        </div>

        {/* Center: Desktop Nav (Home / Menu / About) */}
        <div className="hidden md:flex space-x-6 lg:space-x-8">
          {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className={`font-medium flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-300 hover:scale-105 ${getNavLinkColor(location.pathname === to)}`}
            >
              <Icon className={`w-5 h-5 transition-colors duration-300 ${
                location.pathname === to
                  ? isSolid 
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-orange-200'
                  : isSolid
                    ? 'text-gray-700 dark:text-gray-200'
                    : 'text-white'
              }`} aria-hidden="true" />
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
                ? 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                : 'border-white/30 hover:bg-white/10'}`}
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-400/40 to-pink-500/40 opacity-0 group-hover:opacity-100 blur-md transition" />
            {mode === 'dark'
              ? <Sun className={`w-5 h-5 ${getIconColor()}`} aria-hidden="true" />
              : <Moon className={`w-5 h-5 ${getIconColor()}`} aria-hidden="true" />}
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
                  aria-haspopup="menu"
                  aria-expanded={isDropdownOpen}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center 
                    ${isHoveringUser || isDropdownOpen
                      ? 'bg-gradient-to-br from-orange-600 to-orange-400 shadow-lg'
                      : 'bg-gradient-to-br from-orange-500 to-orange-400'
                    }`}>
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <p className={`hidden sm:block text-sm font-semibold truncate max-w-24 transition-colors duration-300 ${getUsernameColor()}`}>
                      {getDisplayUsername()}
                    </p>
                    <ChevronDown
                      className={`w-4 h-4 transition-all duration-300 ${getIconColor()}
                        ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                      aria-hidden="true"
                    />
                  </div>
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-[95]"
                    role="menu"
                  >
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
                        role="menuitem"
                      >
                        <UserCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                        Profile
                      </button>
                      <button
                        onClick={handleHistory}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                        role="menuitem"
                      >
                        <History className="w-4 h-4 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                        History
                      </button>
                      <button
                        onClick={handleFavourites}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                        role="menuitem"
                      >
                        <Heart className="w-4 h-4 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                        Favourites
                      </button>
                      <div className="mx-4 my-2 border-t border-gray-200 dark:border-gray-700"></div>
                      <button
                        onClick={handleLogout}
                        className="w-[90%] mx-auto mb-2 px-2.5 py-1.5 flex items-center justify-center gap-1.5 
                          bg-red-50 dark:bg-red-900/40 hover:bg-red-100 dark:hover:bg-red-800/60 
                          border border-red-200 dark:border-red-700 text-red-600 rounded-md"
                        role="menuitem"
                      >
                        <LogOut className="w-3.5 h-3.5" aria-hidden="true" /> Logout
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
            className={`md:hidden inline-flex items-center justify-center p-2 rounded-lg border transition
              ${isSolid
                ? 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                : 'border-white/30 hover:bg-white/10'}`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-drawer"
          >
            {mobileOpen ? <X className={`w-6 h-6 ${getIconColor()}`} aria-hidden="true" /> : <Menu className={`w-6 h-6 ${getIconColor()}`} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        className={`md:hidden fixed inset-0 z-[90] transition ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
          onTouchMove={(e) => e.preventDefault()} /* prevent iOS background scroll */
        />

        {/* Panel */}
        <aside
          ref={drawerRef}
          className={`absolute right-0 top-0 h-[100svh] w-80 max-w-[85%] bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-100 dark:border-gray-800 transform transition-transform duration-300 will-change-transform
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img src={elephantLogo} alt="Elephant Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">FILA</span>
            </div>
            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close menu">
              <X className="w-5 h-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
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
                      <UserCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                      Profile
                    </button>
                    <button
                      onClick={handleHistory}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <History className="w-5 h-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                      History
                    </button>
                    <button
                      onClick={handleFavourites}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Heart className="w-5 h-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                      Favourites
                    </button>
                  </div>

                  <div className="my-3 border-t border-gray-200 dark:border-gray-800" />
                </>
              )}

              {/* Main nav links + Cart for mobile */}
              {[...NAV_ITEMS].map(({ label, to, icon: Icon }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition
                    ${location.pathname === to
                      ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'
                      : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <Icon className="w-5 h-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                  <span className="text-base">{label}</span>
                </Link>
              ))}

              {/* If not logged in, show Login here */}
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

              {/* Logout at the END */}
              {isLoggedIn && (
                <>
                  <div className="my-3 border-t border-gray-200 dark:border-gray-800" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-800/60 border border-red-200 dark:border-red-800 text-red-600"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </nav>
  );
};

export default Navbar;