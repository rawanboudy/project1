import React from 'react';
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
      <Route path="/profile/favorites" element={<PrivateRoute element={<ProfileFavorites />} />} />
        <Route path="/product/:id" element={<PrivateRoute element={<ProductDetailsPage />} />} />
        <Route path="/checkout" element={<PrivateRoute element={<CheckoutPage />} />} />
           <Route path="/profile/history" element={<PrivateRoute element={<OrderHistoryPage />} />} />
           <Route path="/order-success" element={<PrivateRoute element={<OrderSuccess />} />} />
           <Route path="/profile/order/:id" element={<PrivateRoute element={<OrderTracking />} />} />

      </Routes>
    </Router>
  );
}

export default App;
