<template>
    <header
      class="sticky top-0 z-30 h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800 flex items-center px-5 md:px-8"
    >
      <div class="flex items-center w-full gap-5">
        <!-- Mobile sidebar button -->
        <button
          @click="$emit('toggleSidebar')"
          class="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          <Menu :size="20" />
        </button>
  
        <!-- Search -->
        <div class="hidden md:block relative max-w-[540px] w-full">
          <Search
            :size="18"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
  
          <input
            type="text"
            placeholder="Search notices, events, announcements..."
            class="w-full h-12 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-2xl pl-11 pr-4 text-sm text-slate-800 dark:text-slate-200 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 transition"
          />
        </div>
  
        <!-- Right -->
        <div class="ml-auto flex items-center gap-3">
          <!-- Existing project notification component -->
          <NotificationBell
            :refresh-key="notificationRefreshKey"
          />
  
          <!-- Theme button -->
          <button
            @click="toggleTheme"
            class="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-indigo-600 transition"
            :title="isDark ? 'Light mode' : 'Dark mode'"
          >
            <Sun v-if="isDark" :size="18" />
            <Moon v-else :size="18" />
          </button>
  
          <!-- Profile -->
          <div
            class="flex items-center gap-3 ml-1 pl-3 border-l border-slate-200 dark:border-slate-700"
          >
            <div
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20"
            >
              {{ userInitial }}
            </div>
  
            <div class="hidden xl:block">
              <p
                class="text-sm font-bold text-slate-800 dark:text-slate-100"
              >
                {{ user?.name || 'UniBoard User' }}
              </p>
  
              <p class="text-[11px] text-slate-400 capitalize">
                {{ user?.role || 'student' }} Account
              </p>
            </div>
  
            <ChevronDown
              :size="16"
              class="hidden xl:block text-slate-400"
            />
          </div>
        </div>
      </div>
    </header>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  import {
    Menu,
    Search,
    Sun,
    Moon,
    ChevronDown
  } from 'lucide-vue-next';
  
  import NotificationBell from './NotificationBell.vue';
  import authService from '../services/authService';
  import { useTheme } from '../composables/useTheme';
  
  defineProps({
    notificationRefreshKey: {
      type: Number,
      default: 0
    }
  });
  
  defineEmits(['toggleSidebar']);
  
  const user = computed(() => authService.getCurrentUser());
  
  const userInitial = computed(() => {
    return user.value?.name?.charAt(0)?.toUpperCase() || 'U';
  });
  
  const { isDark, toggleTheme } = useTheme();
  </script>