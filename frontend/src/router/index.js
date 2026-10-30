import { createRouter, createWebHistory } from 'vue-router';
import authService from '../services/authService';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import ForgotPasswordView from '../views/ForgotPasswordView.vue';
import ResetPasswordView from '../views/ResetPasswordView.vue';
import DashboardView from '../views/DashboardView.vue';
import FeedView from '../views/FeedView.vue';
import NoticeDetailView from '../views/NoticeDetailView.vue';
import AdminPanelView from '../views/AdminPanelView.vue';
import SavedNoticesView from '../views/SavedNoticesView.vue';
import CampusEventsView from '../views/CampusEventsView.vue';
import SettingsView from '../views/SettingsView.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: LoginView, props: { portal: 'student' }, meta: { beginLogin: true } },
  { path: '/admin/login', name: 'admin-login', component: LoginView, props: { portal: 'admin' }, meta: { beginLogin: true } },
  { path: '/register', name: 'register', component: RegisterView, meta: { beginLogin: true } },
  { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView },
  { path: '/reset-password/:token', name: 'reset-password', component: ResetPasswordView },
  { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/feed', name: 'feed', component: FeedView, meta: { requiresAuth: true } },
  { path: '/notices/:id', name: 'notice-detail', component: NoticeDetailView, meta: { requiresAuth: true } },
  { path: '/saved', name: 'saved', component: SavedNoticesView, meta: { requiresAuth: true } },
  { path: '/events', name: 'events', component: CampusEventsView, meta: { requiresAuth: true } },
  { path: '/settings', name: 'settings', component: SettingsView, meta: { requiresAuth: true } },
  { path: '/admin', name: 'admin', component: AdminPanelView, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
];
const router = createRouter({ history: createWebHistory(), routes });
router.beforeEach(async to => {
  if (to.meta.beginLogin) {
    authService.logout();
    return true;
  }
  if (!to.meta.requiresAuth) return true;
  const loginPath = to.meta.requiresAdmin ? '/admin/login' : authService.loginPathFor(authService.getCurrentUser()?.role);
  if (!authService.isAuthenticated()) return { path: loginPath };
  let user;
  try { user = await authService.refreshUser(); }
  catch (error) {
    authService.logout();
    return { path: loginPath, query: { reason: error.response?.status === 401 ? 'expired' : 'unavailable' } };
  }
  if (to.meta.requiresAdmin && user.role !== 'admin') return { name: 'feed' };
  return true;
});
export default router;
