<template>
    <aside
      :class="[
        'fixed left-0 top-0 z-50 h-screen w-[270px] bg-[#0b1120] text-white transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo -->
      <div class="h-20 flex items-center px-6 border-b border-white/10">
        <router-link
          to="/dashboard"
          class="flex items-center gap-3"
          @click="$emit('close')"
        >
          <div
            class="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30"
          >
            <GraduationCap :size="24" />
          </div>
  
          <div>
            <h1 class="text-xl font-black tracking-tight">
              UniBoard
            </h1>
  
            <p class="text-[10px] text-slate-400 uppercase tracking-widest">
              Campus Hub
            </p>
          </div>
        </router-link>
  
        <button
          @click="$emit('close')"
          class="lg:hidden ml-auto text-slate-400 hover:text-white"
        >
          <X :size="21" />
        </button>
      </div>
  
      <!-- Profile -->
      <div class="px-4 mt-5">
        <div
          class="p-4 rounded-2xl bg-white/[0.06] border border-white/10"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center font-black"
            >
              {{ userInitial }}
            </div>
  
            <div class="min-w-0">
              <h3 class="text-sm font-bold truncate">
                {{ user?.name || 'UniBoard User' }}
              </h3>
  
              <div class="flex items-center gap-2 mt-1">
                <p class="text-xs text-slate-400 capitalize">
                  {{ user?.role || 'student' }}
                </p>
  
                <span
                  v-if="user?.batch && user.batch !== 'N/A'"
                  class="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300"
                >
                  Batch {{ user.batch }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Navigation -->
      <nav class="px-4 mt-7">
        <p
          class="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase px-3 mb-3"
        >
          Main Menu
        </p>
  
        <div class="space-y-2">
          <!-- Dashboard -->
          <router-link
            to="/dashboard"
            class="sidebar-link"
            active-class="sidebar-active"
            @click="$emit('close')"
          >
            <LayoutDashboard :size="19" />
            Dashboard
          </router-link>
  
          <!-- Notice Feed -->
          <router-link
            to="/feed"
            class="sidebar-link"
            active-class="sidebar-active"
            @click="$emit('close')"
          >
            <Megaphone :size="19" />
  
            Notice Feed
  
            <span
              class="ml-auto bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full"
            >
              NEW
            </span>
          </router-link>
  
          <!-- Saved -->
          <button
            type="button"
            class="sidebar-link w-full"
          >
            <Bookmark :size="19" />
            Saved Notices
          </button>
  
          <!-- Events -->
          <button
            type="button"
            class="sidebar-link w-full"
          >
            <CalendarDays :size="19" />
            Campus Events
          </button>
        </div>
  
        <!-- Account -->
        <p
          class="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase px-3 mb-3 mt-8"
        >
          Account
        </p>
  
        <div class="space-y-2">
          <!-- Only admins see this -->
          <router-link
            v-if="user?.role === 'admin'"
            to="/admin"
            class="sidebar-link"
            active-class="sidebar-active"
            @click="$emit('close')"
          >
            <ShieldCheck :size="19" />
            Admin Panel
          </router-link>
  
          <button
            type="button"
            class="sidebar-link w-full"
          >
            <Settings :size="19" />
            Settings
          </button>
        </div>
      </nav>
  
      <!-- Logout -->
      <div class="absolute bottom-5 left-4 right-4">
        <button
          @click="logout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"
        >
          <LogOut :size="18" />
          Logout
        </button>
      </div>
  
      <!-- Background Glow -->
      <div
        class="absolute pointer-events-none -bottom-20 -left-20 w-56 h-56 bg-indigo-600/20 blur-[100px] rounded-full"
      ></div>
    </aside>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  
  import {
    GraduationCap,
    LayoutDashboard,
    Megaphone,
    Bookmark,
    CalendarDays,
    ShieldCheck,
    Settings,
    LogOut,
    X
  } from 'lucide-vue-next';
  
  import authService from '../services/authService';
  
  defineProps({
    sidebarOpen: {
      type: Boolean,
      default: false
    }
  });
  
  defineEmits(['close']);
  
  const router = useRouter();
  
  const user = computed(() => authService.getCurrentUser());
  
  const userInitial = computed(() => {
    return user.value?.name?.charAt(0)?.toUpperCase() || 'U';
  });
  
  const logout = () => {
    authService.logout();
    router.push({ name: 'login' });
  };
  </script>
  
  <style scoped>
  .sidebar-link {
    @apply flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 transition-all duration-200;
  }
  
  .sidebar-link:hover {
    @apply text-white translate-x-1;
    background-color: rgba(255, 255, 255, 0.06);
  }
  
  .sidebar-active {
    @apply bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/30;
  }
  </style>