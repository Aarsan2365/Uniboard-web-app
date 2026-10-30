import api from './api';
import { getToken, getCurrentUser, setCurrentUser, saveSession, clearSession, loginPathFor } from './authSession';

const login = async (email, password, portal = 'student', options = {}) => {
  clearSession();
  const endpoint = portal === 'admin' ? '/auth/admin/login' : '/auth/login';
  const { data } = await api.post(endpoint, { email, password }, options);
  if (options.signal?.aborted) throw new Error('Sign in cancelled.');
  saveSession(data);
  return data.user;
};

const register = async (name, email, password, batch, options = {}) => {
  clearSession();
  return (await api.post('/auth/register', { name, email, password, batch }, options)).data;
};

const logout = clearSession;
const isAuthenticated = () => Boolean(getToken());
const forgotPassword = async (email) => (await api.post('/auth/forgot-password', { email })).data;
const resetPassword = async (token, password) => (await api.post(`/auth/reset-password/${token}`, { password })).data;

const refreshUser = async () => {
  const { data } = await api.get('/auth/me');
  setCurrentUser(data.user);
  return data.user;
};
const updateProfile = async profile => {
  const { data } = await api.put('/auth/me', profile);
  setCurrentUser(data.user);
  return data.user;
};
export default { refreshUser, updateProfile, login, register, logout, getCurrentUser, getToken, isAuthenticated, forgotPassword, resetPassword, loginPathFor };
