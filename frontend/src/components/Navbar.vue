<!--
  components/Navbar.vue

  Shows different links depending on whether the current user is an
  admin or a student — a small, visible example of role-based UI.
-->
<template>
  <nav class="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-3.5 flex items-center justify-between transition-all duration-300">
    <div class="flex items-center gap-3">
      <router-link to="/feed" class="flex items-center gap-2 group">
        <div class="h-9 w-9 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform duration-200">
          U
        </div>
        <span class="text-lg font-extrabold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">UniBoard</span>
      </router-link>
    </div>

    <div class="flex items-center gap-5">
      <div class="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-lg">
        <router-link
          to="/feed"
          class="text-xs font-semibold px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
          active-class="bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm"
        >
          Notice Feed
        </router-link>

        <router-link
          v-if="user?.role === 'admin'"
          to="/admin"
          class="text-xs font-semibold px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
          active-class="bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm"
        >
          Admin Panel
        </router-link>
      </div>

      <span class="h-4 w-px bg-slate-200 dark:bg-slate-700"></span>

      <div class="flex items-center gap-3">
        <NotificationBell :refresh-key="notificationRefreshKey" />

        <!-- Theme Toggle Button -->
        <button
          @click="toggleTheme"
          class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          aria-label="Toggle theme"
        >
          <!-- Sun icon (shown in dark mode) -->
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <!-- Moon icon (shown in light mode) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <span class="h-4 w-px bg-slate-200 dark:bg-slate-700"></span>

        <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 pl-2.5 pr-2.5 py-1 rounded-full">
          <div class="h-6 w-6 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800 text-brand-700 dark:text-brand-300 flex items-center justify-center text-[10px] font-bold uppercase">
            {{ user?.name ? user.name[0] : 'U' }}
          </div>
          <span class="text-xs font-medium text-slate-700 dark:text-slate-300">
            {{ user?.name }}
            <span class="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider">
              {{ user?.role }}
            </span>
            <span
              v-if="user?.batch && user.batch !== 'N/A'"
              class="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400 font-bold uppercase tracking-wider"
            >
              {{ user.batch }}
            </span>
          </span>
        </div>

        <button
          @click="handleLogout"
          class="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors px-2 py-1"
        >
          Log out
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';
import NotificationBell from './NotificationBell.vue';
import { useTheme } from '../composables/useTheme';

// Bumped by parent views (e.g. after marking a notice as read) so the
// bell refetches immediately instead of waiting for its poll interval.
const props = defineProps({
  notificationRefreshKey: { type: Number, default: 0 },
});

const router = useRouter();
const user = computed(() => authService.getCurrentUser());
const { isDark, toggleTheme } = useTheme();

const handleLogout = () => {
  authService.logout();
  router.push({ name: 'login' });
};
</script>
