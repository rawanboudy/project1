// src/axiosConfig.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://yummyfood.runasp.net/api/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// add no-cache headers to every GET
instance.defaults.headers.get['Cache-Control'] = 'no-cache';
instance.defaults.headers.get['Pragma']        = 'no-cache';
instance.defaults.headers.get['Expires']       = '0';

// attach a timestamp param to bust any remaining cache
instance.interceptors.request.use(config => {
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _: Date.now(),
    };
  }
    const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
