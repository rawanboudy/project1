import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PrivateRoute = ({ element, ...rest }) => {
  const isLoggedIn = localStorage.getItem('token');
  const hasShownToast = useRef(false);

  useEffect(() => {
    // Only show toast if user is not logged in and we haven't shown it for this component instance
    if (!isLoggedIn && !hasShownToast.current) {
      toast.error('You need to be logged in to access this page!', {
        duration: 4000,
      });
      
      // Mark that we've shown the toast for this component instance
      hasShownToast.current = true;
    }
    
    // Reset the flag if user becomes logged in
    if (isLoggedIn) {
      hasShownToast.current = false;
    }
  }, [isLoggedIn]);

  // If user is not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the protected element
  return element;
};

export default PrivateRoute;