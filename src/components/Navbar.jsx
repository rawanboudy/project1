// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, User } from 'lucide-react';
import theme from '../theme';

const NAV_ITEMS = [
  { label: 'Home',    to: '/'       },
  { label: 'Menu',    to: '/menu'   },
  { label: 'About',   to: '/about'  },
  { label: 'Cart',    to: '/cart'   },
  { label: 'Contact', to: '/contact'}
];

const Navbar = ({ scrollY }) => {
  const navigate  = useNavigate();
  const location  = useLocation();  
  const isSolid   = typeof scrollY === 'number' ? scrollY > 50 : true;
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  return (
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

        {/* Login or Profile Icon */}
        {isLoggedIn ? (
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})`
            }}
          >
            <User className="w-5 h-5 text-white" />
          </button>
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
  );
};

export default Navbar;
