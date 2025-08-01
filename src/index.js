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
    <Toaster
      position="top-right"
      containerStyle={{
        // bump it down 80px from the top:
        top: '50px',
        // if you want to shift it horizontally, you can adjust right/left too:
        // right: '20px'
      }}
      toastOptions={{
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
