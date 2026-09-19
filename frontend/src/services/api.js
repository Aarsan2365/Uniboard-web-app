// services/api.js
//
// A single configured axios instance shared by every service file.
// The request interceptor automatically attaches the stored JWT
// (if we have one) to every outgoing request, so individual service
// functions never have to think about auth headers.

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('uniboard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
