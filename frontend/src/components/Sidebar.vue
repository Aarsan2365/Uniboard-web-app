<template>
  <aside
    :class="[
      'fixed left-0 top-0 z-50 h-screen overflow-y-auto w-[270px] bg-[#0A0A0A] border-r border-[#262626] text-white transition-transform duration-300',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <div class="h-20 flex items-center px-6 border-b border-[#262626]">
      <router-link to="/feed" class="flex items-center gap-3" @click="$emit('close')">
        <div class="w-11 h-11 rounded-xl bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center shadow-lg shadow-yellow-500/10">
          <AppIcon name="graduation" :size="24" />
        </div>
        <div>
          <h1 class="text-xl font-black tracking-tight text-white">UniBoard</h1>
          <p class="text-[10px] text-[#A3A3A3] uppercase tracking-[0.18em]">Digital Notice Board</p>
        </div>
      </router-link>

      <button
        type="button"
        class="lg:hidden ml-auto w-9 h-9 flex items-center justify-center rounded-lg text-[#A3A3A3] hover:text-[#FFD60A] hover:bg-[#181818] transition"
        @click="$emit('close')"
      >
        <AppIcon name="close" :size="21" />
      </button>
    </div>

    <div class="px-4 mt-5">
      <div class="p-4 rounded-2xl bg-[#151515] border border-[#2A2A2A]">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 shrink-0 rounded-xl bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center font-black">
            {{ userInitial }}
          </div>
          <div class="min-w-0">
            <h3 class="text-sm font-bold text-white truncate">{{ user?.name || 'UniBoard User' }}</h3>
            <div class="flex items-center gap-2 mt-1">
              <p class="text-xs text-[#A3A3A3] capitalize">{{ user?.role || 'student' }}</p>
              <span
                v-if="user?.batch && user.batch !== 'N/A'"
                class="text-[9px] px-2 py-0.5 rounded-full bg-[#FFD60A] text-[#0A0A0A] font-bold"
              >
                Batch {{ user.batch }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <nav class="px-4 mt-7">
      <p class="text-[10px] font-bold tracking-[0.22em] text-[#646363] uppercase px-3 mb-3">Main Menu</p>
      <div class="space-y-2">
        <router-link to="/feed" class="sidebar-link" active-class="sidebar-active" @click="$emit('close')">
          <AppIcon name="megaphone" :size="19" /><span>Notice Feed</span>

        </router-link>
        <router-link
  to="/saved"
  class="sidebar-link"
  active-class="sidebar-active"
  @click="$emit('close')"
>
  <AppIcon name="bookmark" :size="19" />
  <span>Saved Notices</span>
</router-link>

<router-link
  to="/events"
  class="sidebar-link"
  active-class="sidebar-active"
  @click="$emit('close')"
>
  <AppIcon name="calendar" :size="19" />
  <span>University Events</span>
</router-link>
      </div>

      <router-link to="/dashboard" class="sidebar-link mt-2" active-class="sidebar-active" @click="$emit('close')"><AppIcon name="dashboard" :size="19" /><span>Activity Overview</span></router-link>
      <p class="text-[10px] font-bold tracking-[0.22em] text-[#646363] uppercase px-3 mb-3 mt-8">Account</p>
      <div class="space-y-2">
        <router-link
          v-if="user?.role === 'admin'"
          to="/admin"
          class="sidebar-link"
          active-class="sidebar-active"
          @click="$emit('close')"
        >
          <AppIcon name="shield" :size="19" /><span>Admin Panel</span>
        </router-link>
        <router-link to="/settings" class="sidebar-link" active-class="sidebar-active" @click="$emit('close')">
          <AppIcon name="settings" :size="19" /><span>Settings</span>
        </router-link>
      </div>
    </nav>

    <div class="absolute pointer-events-none -bottom-24 -left-24 w-64 h-64 bg-yellow-400/5 blur-[110px] rounded-full"></div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import AppIcon from './AppIcon.vue';
import authService from '../services/authService';

defineProps({
  sidebarOpen: { type: Boolean, default: false },
});

defineEmits(['close']);

const user = computed(() => authService.getCurrentUser());
const userInitial = computed(() => user.value?.name?.charAt(0)?.toUpperCase() || 'U');
</script>

<style scoped>
.sidebar-link {
  @apply flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200;
  color: #a3a3a3;
}
.sidebar-link:hover {
  background: #181818;
  color: #ffd60a;
  transform: translateX(3px);
}
.sidebar-active {
  background: #ffd60a !important;
  color: #0a0a0a !important;
  box-shadow: 0 8px 22px rgba(255, 214, 10, 0.12);
}
.sidebar-active svg { color: #0a0a0a; }
button.sidebar-link { border: none; outline: none; }
</style>
