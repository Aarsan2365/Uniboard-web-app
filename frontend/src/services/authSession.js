import { ref } from 'vue';

const TOKEN_KEY = 'uniboard_token';
const USER_KEY = 'uniboard_user';

// Remove sessions remembered by earlier versions. Keep the user's theme preference.
for (const key of [TOKEN_KEY, USER_KEY, 'token', 'user']) localStorage.removeItem(key);

const readUser = () => {
  try { return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null'); }
  catch { return null; }
};
const currentUser = ref(readUser());

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const getCurrentUser = () => currentUser.value;
export const setCurrentUser = user => {
  currentUser.value = user;
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
};
export const clearSession = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  currentUser.value = null;
};
export const saveSession = ({ token, user }) => {
  sessionStorage.setItem(TOKEN_KEY, token);
  setCurrentUser(user);
};
export const loginPathFor = role => role === 'admin' ? '/admin/login' : '/login';
