// src/App.jsx
import React, { Suspense, useEffect, useState } from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';

// 🔻 Lazy-load pages (code-splitting per route)
const LoginPage            = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage         = React.lazy(() => import('./pages/RegisterPage'));
const RestaurantHomepage   = React.lazy(() => import('./pages/home'));
const ProfilePage          = React.lazy(() => import('./pages/ProfilePage'));
const MenuPage             = React.lazy(() => import('./pages/MenuPage'));
const CartPage             = React.lazy(() => import('./pages/CartPage'));
const AboutPage            = React.lazy(() => import('./pages/AboutPage'));
const ProfileFavorites     = React.lazy(() => import('./pages/ProfileFavorites'));
const ProductDetailsPage   = React.lazy(() => import('./pages/ProductDetailsPage'));
const CheckoutPage         = React.lazy(() => import('./pages/CheckoutPage'));
const OrderHistoryPage     = React.lazy(() => import('./pages/OrderHistory'));
const OrderSuccess         = React.lazy(() => import('./pages/OrderSuccess'));
const OrderTracking        = React.lazy(() => import('./pages/orderTracking'));
const ForgotPasswordPage   = React.lazy(() => import('./pages/forgetPassword'));
const NotFoundPage         = React.lazy(() => import('./pages/NotFoundPage'));

/* ---------------- Full-page fallback while chunks load ---------------- */
function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <div className="bg-gray-50 rounded-xl p-4 shadow">
          <p className="text-sm text-gray-700">Loading…</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Tiny top progress bar on route changes -------------- */
function RouteProgressBar() {
  const location = useLocation();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const t = setTimeout(() => setActive(false), 500);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: active ? 3 : 0,
        width: active ? '100%' : 0,
        background: 'linear-gradient(90deg,#fb923c,#f97316)',
        boxShadow: active ? '0 0 8px rgba(249,115,22,0.4)' : 'none',
        transition: 'height 150ms ease, width 150ms ease',
        zIndex: 9999,
      }}
    />
  );
}

/* --------- (Optional) Warm up popular route chunks when idle ---------- */
function useWarmRouteChunks() {
  useEffect(() => {
    const idle = (cb) =>
      (window.requestIdleCallback
        ? window.requestIdleCallback(cb, { timeout: 2000 })
        : setTimeout(cb, 500));

    idle(() => {
      // These imports only fetch; they don't render.
      import('./pages/MenuPage');
      import('./pages/ProductDetailsPage');
      import('./pages/CartPage');
      import('./pages/CheckoutPage');
      import('./pages/ProfilePage');
    });
  }, []);
}

/* ----------------------- Error boundary for Suspense ------------------- */
class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <p className="font-semibold">Failed to load this page.</p>
            <p className="text-sm mt-1">Please check your connection and try again.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ------------------------------ App shell ----------------------------- */
function AppShell() {
  useWarmRouteChunks();

  return (
    <>
      <RouteProgressBar />
      <ChunkErrorBoundary>
        <Suspense fallback={<FullPageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/"                element={<RestaurantHomepage />} />
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/about"           element={<AboutPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/menu"            element={<MenuPage />} />
            <Route path="/product/:id"     element={<ProductDetailsPage />} />

            {/* Private Routes */}
            <Route path="/profile"                element={<PrivateRoute element={<ProfilePage />} />} />
            <Route path="/cart"                   element={<PrivateRoute element={<CartPage />} />} />
            <Route path="/profile/favorites"      element={<PrivateRoute element={<ProfileFavorites />} />} />
            <Route path="/checkout"               element={<PrivateRoute element={<CheckoutPage />} />} />
            <Route path="/profile/history"        element={<PrivateRoute element={<OrderHistoryPage />} />} />
            <Route path="/order-success"          element={<PrivateRoute element={<OrderSuccess />} />} />
            <Route path="/profile/order/:id"      element={<PrivateRoute element={<OrderTracking />} />} />

            {/* 404 Route - Must be last */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ChunkErrorBoundary>
    </>
  );
}

/* --------------------------------- App -------------------------------- */
export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
