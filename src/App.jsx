import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RestaurantHomepage from './pages/home';
import ProfilePage from './pages/ProfilePage';
import MenuPage from './pages/MenuPage';
import { CartProvider } from './context/CartContext';
import AboutPage from './pages/AboutPage';
import CartPage from './pages/CartPage';
import { Toaster } from 'react-hot-toast';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
function App() {
  return (
    <>
    <Toaster position="top-right" reverseOrder={false} />
    <Router>
      
      <Routes>
        <Route path="/" element={<RestaurantHomepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        
      </Routes>
      
    </Router>
    </>
  );
}

export default App;
