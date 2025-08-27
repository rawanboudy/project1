import React from 'react';
import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RestaurantHomepage from './pages/home';
import ProfilePage from './pages/ProfilePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import AboutPage from './pages/AboutPage';
import ProfileFavorites from './pages/ProfileFavorites';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute
import OrderHistoryPage from './pages/OrderHistory';
import OrderSuccess from './pages/OrderSuccess';
import OrderTracking from './pages/orderTracking';
import ForgotPasswordPage from './pages/forgetPassword';
import NotFoundPage from './pages/NotFoundPage'; // Import 404 page

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RestaurantHomepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/menu" element={<MenuPage />}  />
         <Route path="/product/:id" element={<ProductDetailsPage />} />
        
        {/* Private Routes */}
        <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />               
        <Route path="/cart" element={<PrivateRoute element={<CartPage />} />} />
        <Route path="/profile/favorites" element={<PrivateRoute element={<ProfileFavorites />} />} />
       
        <Route path="/checkout" element={<PrivateRoute element={<CheckoutPage />} />} />          
        <Route path="/profile/history" element={<PrivateRoute element={<OrderHistoryPage />} />} />          
        <Route path="/order-success" element={<PrivateRoute element={<OrderSuccess />} />} />          
        <Route path="/profile/order/:id" element={<PrivateRoute element={<OrderTracking />} />} />

        {/* 404 Route - Must be last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;