import { createRouter, createWebHistory } from 'vue-router';
import authService from '../services/authService';

import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import ForgotPasswordView from '../views/ForgotPasswordView.vue';
import ResetPasswordView from '../views/ResetPasswordView.vue';
import DashboardView from '../views/DashboardView.vue';
import FeedView from '../views/FeedView.vue';
import AdminPanelView from '../views/AdminPanelView.vue';

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
  { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
  { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView, meta: { guestOnly: true } },
  { path: '/reset-password/:token', name: 'reset-password', component: ResetPasswordView, meta: { guestOnly: true } },
  { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/feed', name: 'feed', component: FeedView, meta: { requiresAuth: true } },
  { path: '/admin', name: 'admin', component: AdminPanelView, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const authenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (to.meta.requiresAuth && !authenticated) return { name: 'login' };
  if (to.meta.guestOnly && authenticated) return { name: 'dashboard' };
  if (to.meta.requiresAdmin && user?.role !== 'admin') return { name: 'dashboard' };
  return true;
});

export default router;
