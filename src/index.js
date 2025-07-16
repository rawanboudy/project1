// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    {/* <-- Add the Toaster here so your toasts can show anywhere */}
    <Toaster 
      position="top-right" 
      toastOptions={{
        // Default options for all toasts
        duration: 3000,
        style: {
          borderRadius: '8px',
          background: '#333',
          color: '#fff',
        },
      }}
    />
  </React.StrictMode>
);

reportWebVitals();
