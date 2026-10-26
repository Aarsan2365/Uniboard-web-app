import api from './api';

const TOKEN_KEY = 'uniboard_token';
const USER_KEY = 'uniboard_user';

const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
};

const register = async (name, email, password, role, batch) => {
  const { data } = await api.post('/auth/register', { name, email, password, role, batch });
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
};

const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

const getCurrentUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); }
  catch { localStorage.removeItem(USER_KEY); return null; }
};

const getToken = () => localStorage.getItem(TOKEN_KEY);
const isAuthenticated = () => Boolean(getToken());
const forgotPassword = async (email) => (await api.post('/auth/forgot-password', { email })).data;
const resetPassword = async (token, password) => (await api.post(`/auth/reset-password/${token}`, { password })).data;

export default { login, register, logout, getCurrentUser, getToken, isAuthenticated, forgotPassword, resetPassword };
