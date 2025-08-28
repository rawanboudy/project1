// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User, LogOut, UserCircle, ShoppingCart, Home, BookOpen,
  History, ChevronDown, Heart, Moon, Sun
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
  const dropdownRef = useRef(null);

  const isSolid = typeof scrollY === 'number' ? scrollY > 50 : true;

  // Theme (light/dark)
  const { theme: mode, toggleTheme } = useTheme();

  // ----- User session -----
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
  const user = getUserInfo();
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  const getDisplayUsername = () => {
    if (!user) return 'User';
    if (user.firstname && user.lastname) return `${user.firstname} ${user.lastname}`;
    if (user.firstname) return user.firstname;
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  // ----- Effects -----
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => setIsDropdownOpen(false), [location.pathname]);

  // ----- Handlers -----
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userInfo');
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

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 
        ${isSolid
          ? 'bg-white/95 dark:bg-gray-900/90 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">

        {/* Logo */}
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

        {/* Desktop Navbar Links */}
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
                    : 'text-gray-900 dark:text-white hover:bg-gray-100/40 dark:hover:bg-white/10'}`
              }
            >
              <span className="w-5 h-5">{icon}</span>
              <span className="text-sm lg:text-base">{label}</span>
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-4">
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
            {/* glow on hover */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-400/40 to-pink-500/40 opacity-0 group-hover:opacity-100 blur-md transition" />
            {mode === 'dark'
              ? <Sun className="w-5 h-5 text-yellow-400 transition-transform duration-300 group-active:rotate-90" />
              : <Moon className="w-5 h-5 text-indigo-500 transition-transform duration-300 group-active:-rotate-90" />}
          </button>

          {/* User Dropdown */}
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
                <div className="hidden sm:flex items-center gap-2">
                  <p className={`text-sm font-semibold truncate max-w-24 transition-colors
                     ${isSolid ? 'text-gray-800 dark:text-gray-100' : 'text-gray-900 dark:text-white'}`}>
                    {getDisplayUsername()}
                  </p>
                  <ChevronDown
                    className={`w-4 h-4 transition-all
                      ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}
                      ${isSolid ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}
                  />
                </div>
              </button>

              {/* Dropdown menu */}
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
                      <UserCircle className="w-4 h-4 text-blue-600" />
                      Profile
                    </button>
                    <button
                      onClick={handleHistory}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                    >
                      <History className="w-4 h-4 text-purple-600" />
                      History
                    </button>
                    <button
                      onClick={handleFavourites}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                    >
                      <Heart className="w-4 h-4 text-red-600" />
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
              className={`px-6 py-2 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg
                bg-gradient-to-r from-orange-400 to-orange-600`}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
