import axios from 'axios';
import { getToken, getCurrentUser, clearSession, loginPathFor } from './authSession';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
  // Axios chooses JSON or multipart automatically according to the request body.
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && /<(!doctype|html)/i.test(response.data)) {
      throw new Error('The API returned a web page. Check the Netlify Function and /api routing.');
    }
    return response;
  },
  (error) => {
    const payload = error.response?.data;
    if (payload?.errors?.length) payload.message = payload.errors.map(item => item.message).join(' ');
    if (!error.response) error.message = 'Cannot reach the UniBoard API. Check that the backend and MongoDB are running.';
    // A wrong password belongs on the login form. Only expired protected requests
    // should send the user back to their portal. /auth/me is handled by the guard.
    const endpoint = error.config?.url || '';
    const publicAuth = /^\/auth\/(?:login|admin\/login|register|forgot-password|reset-password\/)/.test(endpoint);
    if (error.response?.status === 401 && !publicAuth) {
      const loginPath = loginPathFor(getCurrentUser()?.role);
      clearSession();
      if (endpoint !== '/auth/me') window.location.replace(`${loginPath}?reason=expired`);
    }
    return Promise.reject(error);
  }
);

export default api;
