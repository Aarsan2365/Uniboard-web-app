// services/authService.js
//
// Thin wrapper around the /api/auth endpoints. Also owns reading/
// writing the token + user info to localStorage so components don't
// touch localStorage directly.

import api from './api';

const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('uniboard_token', data.token);
  localStorage.setItem('uniboard_user', JSON.stringify(data.user));
  return data.user;
};

const register = async (name, email, password, role, batch) => {
  const { data } = await api.post('/auth/register', { name, email, password, role, batch });
  localStorage.setItem('uniboard_token', data.token);
  localStorage.setItem('uniboard_user', JSON.stringify(data.user));
  return data.user;
};

const logout = () => {
  localStorage.removeItem('uniboard_token');
  localStorage.removeItem('uniboard_user');
};

const getCurrentUser = () => {
  const raw = localStorage.getItem('uniboard_user');
  return raw ? JSON.parse(raw) : null;
};

const isAuthenticated = () => !!localStorage.getItem('uniboard_token');

export default { login, register, logout, getCurrentUser, isAuthenticated };
