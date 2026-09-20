import {
  createRouter,
  createWebHistory
} from 'vue-router';

import authService from '../services/authService';

import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';

import DashboardView from '../views/DashboardView.vue';
import FeedView from '../views/FeedView.vue';
import AdminPanelView from '../views/AdminPanelView.vue';

const routes = [
  // Starting page
  {
    path: '/',
    redirect: '/dashboard'
  },

  // Login
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },

  // Register
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },

  // Dashboard
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      requiresAuth: true
    }
  },

  // Notice Feed
  {
    path: '/feed',
    name: 'feed',
    component: FeedView,
    meta: {
      requiresAuth: true
    }
  },

  // Admin
  {
    path: '/admin',
    name: 'admin',
    component: AdminPanelView,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  },

  // Wrong URL -> Dashboard
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
];

const router = createRouter({
  history: createWebHistory(),

  routes
});

/*
  Navigation security
*/
router.beforeEach(
  (to, from, next) => {
    const isAuthenticated =
      authService.isAuthenticated();

    const user =
      authService.getCurrentUser();

    // User must login
    if (
      to.meta.requiresAuth &&
      !isAuthenticated
    ) {
      return next({
        name: 'login'
      });
    }

    // Only admin can open Admin Panel
    if (
      to.meta.requiresAdmin &&
      user?.role !== 'admin'
    ) {
      return next({
        name: 'dashboard'
      });
    }

    // Logged-in user opening login/register
    if (
      isAuthenticated &&
      (
        to.name === 'login' ||
        to.name === 'register'
      )
    ) {
      return next({
        name: 'dashboard'
      });
    }

    next();
  }
);

export default router;