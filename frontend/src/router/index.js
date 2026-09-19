// router/index.js
//
// Route-level guards mirror the backend's RBAC: `meta.requiresAuth`
// blocks anonymous visitors, and `meta.requiresAdmin` blocks students
// from ever reaching the admin panel — even though the backend would
// reject their API calls anyway, guarding the route too means they
// never even see the admin UI. Defense in depth, and a nice point to
// raise in your viva.

import { createRouter, createWebHistory } from 'vue-router';
import authService from '../services/authService';

import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import FeedView from '../views/FeedView.vue';
import AdminPanelView from '../views/AdminPanelView.vue';

const routes = [
  { path: '/', redirect: '/feed' },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  {
    path: '/feed',
    name: 'feed',
    component: FeedView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminPanelView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthed = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (to.meta.requiresAuth && !isAuthed) {
    return next({ name: 'login' });
  }

  if (to.meta.requiresAdmin && user?.role !== 'admin') {
    return next({ name: 'feed' });
  }

  next();
});

export default router;
