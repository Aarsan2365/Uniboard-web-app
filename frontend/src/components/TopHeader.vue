<template>
  <header class="sticky top-0 z-30 h-20 bg-[var(--header-bg)] border-b border-[var(--border)] flex items-center px-5 md:px-8 transition-colors duration-300">
    <div class="flex items-center w-full gap-5">
      <button
        type="button"
        class="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[#D4AD00] hover:border-[#FFD60A] transition"
        @click="$emit('toggleSidebar')"
      >
        <AppIcon name="menu" :size="20" />
      </button>

      <div class="hidden md:block relative max-w-[540px] w-full">
        <AppIcon name="search" :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search notices, events, announcements..."
          class="w-full h-12 bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl pl-11 pr-4 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#FFD60A] focus:ring-4 focus:ring-yellow-400/10 transition-all duration-200"
        />
      </div>

      <div class="ml-auto flex items-center gap-3">
        <NotificationBell :refresh-key="notificationRefreshKey" />

        <button
          type="button"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          class="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[#D4AD00] hover:border-[#FFD60A] transition-all duration-200"
          @click="toggleTheme"
        >
          <AppIcon :name="isDark ? 'sun' : 'moon'" :size="18" />
        </button>

        <div class="relative" @click.stop>
          <button
            type="button"
            class="flex items-center gap-3 ml-1 pl-4 pr-2 py-2 border-l border-[var(--border)] rounded-xl hover:bg-[var(--surface-hover)] transition-all duration-200"
            @click="toggleProfileMenu"
          >
            <div class="w-10 h-10 rounded-xl bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center font-black shadow-sm">
              {{ userInitial }}
            </div>
            <div class="hidden sm:block text-left">
              <p class="text-sm font-bold text-[var(--text-main)]">{{ user?.name || 'UniBoard User' }}</p>
              <p class="text-[11px] text-[var(--text-secondary)] capitalize">{{ user?.role || 'student' }} Account</p>
            </div>
            <AppIcon
              name="chevron-down"
              :size="17"
              :class="['hidden sm:block text-[var(--text-muted)] transition-transform duration-200', profileMenuOpen ? 'rotate-180' : '']"
            />
          </button>

          <transition name="dropdown">
            <div
              v-if="profileMenuOpen"
              class="absolute right-0 mt-3 w-64 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden z-50 transition-colors duration-300"
            >
              <div class="p-4 border-b border-[var(--border)]">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-xl bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center font-black">{{ userInitial }}</div>
                  <div class="min-w-0">
                    <p class="font-bold text-sm text-[var(--text-main)] truncate">{{ user?.name || 'UniBoard User' }}</p>
                    <p class="text-xs text-[var(--text-secondary)] truncate">{{ user?.email || 'User Account' }}</p>
                  </div>
                </div>
              </div>

              <button type="button" class="profile-item">
                <AppIcon name="user" :size="18" /> My Profile
              </button>
              <button type="button" class="profile-item">
                <AppIcon name="settings" :size="18" /> Settings
              </button>
              <div class="border-t border-[var(--border)]">
                <button type="button" class="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition" @click="logout">
                  <AppIcon name="logout" :size="18" /> Logout
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import AppIcon from './AppIcon.vue';
import NotificationBell from './NotificationBell.vue';
import authService from '../services/authService';
import { useTheme } from '../composables/useTheme';

defineProps({ notificationRefreshKey: { type: Number, default: 0 } });
defineEmits(['toggleSidebar']);

const user = computed(() => authService.getCurrentUser());
const userInitial = computed(() => user.value?.name?.charAt(0)?.toUpperCase() || 'U');
const profileMenuOpen = ref(false);
const toggleProfileMenu = () => { profileMenuOpen.value = !profileMenuOpen.value; };
const closeProfileMenu = () => { profileMenuOpen.value = false; };
const logout = () => {
  profileMenuOpen.value = false;
  authService.logout();
  window.location.replace('/login');
};
const { isDark, toggleTheme } = useTheme();

onMounted(() => window.addEventListener('click', closeProfileMenu));
onUnmounted(() => window.removeEventListener('click', closeProfileMenu));
</script>

<style scoped>
.profile-item {
  @apply w-full flex items-center gap-3 px-4 py-3 text-sm transition;
  color: var(--text-secondary);
}
.profile-item:hover { background: var(--surface-hover); color: #b39200; }
.dropdown-enter-active, .dropdown-leave-active { transition: opacity .18s ease, transform .18s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px) scale(.97); }
</style>
