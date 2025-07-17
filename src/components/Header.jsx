// Header.js
import React from 'react';
import { ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{ padding: '1rem', display: 'flex', alignItems: 'center' }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <ChefHat size={40} />
      </Link>
    </header>
  );
};

export default Header;
