import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RestaurantHomepage from './pages/home';
import ProfilePage from './pages/ProfilePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import AboutPage from './pages/AboutPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RestaurantHomepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Private Routes */}
        <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
        <Route path="/menu" element={<PrivateRoute element={<MenuPage />} />} />
        <Route path="/cart" element={<PrivateRoute element={<CartPage />} />} />
      
        <Route path="/product/:id" element={<PrivateRoute element={<ProductDetailsPage />} />} />
        <Route path="/checkout" element={<PrivateRoute element={<CheckoutPage />} />} />
      </Routes>
    </Router>
  );
}

export default App;
