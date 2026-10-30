<template>
  <div class="relative min-h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--text-main)] flex items-center justify-center px-4 py-10 transition-colors duration-300">
    <div class="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#FFD60A]/10 rounded-full blur-[150px]"></div>
    <div class="relative z-10 w-full max-w-[460px] bg-[var(--surface)] border border-[var(--border)] rounded-[28px] px-6 sm:px-8 py-8 shadow-xl">
      <div class="text-center">
        <div class="mx-auto w-14 h-14 rounded-2xl bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center">
          <AppIcon :name="isAdmin ? 'shield' : 'graduation'" :size="28" />
        </div>
        <p class="font-black text-xl mt-4">UniBoard</p>
        <p class="text-xs text-[var(--text-secondary)] mt-1">Digital Campus Notice Board</p>
      </div>

      <nav aria-label="Choose login portal" class="grid grid-cols-2 gap-1 mt-6 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] p-1">
        <router-link to="/login" :aria-current="!isAdmin ? 'page' : undefined" :class="portalClass(!isAdmin)">Student</router-link>
        <router-link to="/admin/login" :aria-current="isAdmin ? 'page' : undefined" :class="portalClass(isAdmin)">Administrator</router-link>
      </nav>

      <h1 class="text-2xl font-black mt-6">{{ isAdmin ? 'Admin Login' : 'Student Login' }}</h1>
      <p class="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
        {{ isAdmin ? 'Sign in to publish and manage campus announcements.' : 'Sign in to view notices, save updates and join campus discussions.' }}
      </p>
      <p v-if="registered" role="status" class="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-400">Your student account is ready. Sign in to continue.</p>
      <p v-if="sessionMessage" role="status" class="mt-4 text-sm text-[var(--text-secondary)]">{{ sessionMessage }}</p>

      <form class="mt-6 space-y-5" @submit.prevent="handleLogin">
        <div>
          <label for="login-email" class="block text-xs font-bold tracking-wider text-[var(--text-secondary)] uppercase mb-2">Email address</label>
          <input id="login-email" v-model.trim="email" type="email" autocomplete="username" required :placeholder="isAdmin ? 'admin@campus.edu' : 'you@campus.edu'" class="premium-input" :disabled="loading" />
        </div>
        <div>
          <div class="flex items-center justify-between gap-3 mb-2">
            <label for="login-password" class="text-xs font-bold tracking-wider text-[var(--text-secondary)] uppercase">Password</label>
            <router-link :to="{ path: '/forgot-password', query: isAdmin ? { portal: 'admin' } : {} }" class="text-xs font-semibold text-[#8A7200] dark:text-[#FFD60A] hover:underline">Forgot password?</router-link>
          </div>
          <div class="relative">
            <input id="login-password" v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required placeholder="Enter your password" class="premium-input pr-12" :disabled="loading" />
            <button type="button" :aria-label="showPassword ? 'Hide password' : 'Show password'" :aria-pressed="showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" @click="showPassword = !showPassword">
              <AppIcon :name="showPassword ? 'eye-off' : 'eye'" :size="18" />
            </button>
          </div>
        </div>
        <p v-if="error" role="alert" class="text-sm text-red-700 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">{{ error }}</p>
        <button type="submit" :disabled="loading" class="premium-btn-primary w-full py-3.5">
          {{ loading ? 'Signing in...' : isAdmin ? 'Sign in as administrator' : 'Sign in as student' }}
          <AppIcon v-if="!loading" name="arrow-right" :size="18" />
        </button>
      </form>

      <div class="mt-6 border-t border-[var(--border)] pt-5">
        <p v-if="isAdmin" class="text-xs text-[var(--text-secondary)] leading-relaxed text-center">Administrator access is provided by your university. Contact the system administrator if you need an account.</p>
        <template v-else>
          <p class="text-xs text-[var(--text-secondary)] text-center mb-3">New student? Join your campus community.</p>
          <router-link to="/register" class="premium-btn-secondary w-full">Create student account</router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppIcon from '../components/AppIcon.vue';
import authService from '../services/authService';

const props = defineProps({ portal: { type: String, default: 'student' } });
const isAdmin = computed(() => props.portal === 'admin');
const route = useRoute();
const router = useRouter();
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');
let loginRequest = null;
const registered = computed(() => !isAdmin.value && route.query.registered === '1');
const sessionMessage = computed(() => route.query.reason === 'expired'
  ? 'Your session has expired. Please sign in again.'
  : route.query.reason === 'unavailable' ? 'We could not verify your session. Check the server connection and sign in again.' : '');
const portalClass = active => ['rounded-lg px-3 py-2.5 text-center text-sm font-bold transition-colors', active ? 'bg-[#FFD60A] text-[#0A0A0A]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'];

// A portal switch must not keep the previous account's password or error message.
const cancelLogin = () => { loginRequest?.abort(); loginRequest = null; loading.value = false; };
onBeforeUnmount(cancelLogin);
watch(() => props.portal, () => { cancelLogin(); email.value = ''; password.value = ''; error.value = ''; showPassword.value = false; });
const handleLogin = async () => {
  if (loading.value) return;
  error.value = '';
  loading.value = true;
  const submittedPortal = props.portal;
  const request = new AbortController();
  loginRequest = request;
  try {
    await authService.login(email.value, password.value, submittedPortal, { signal: request.signal });
    // A response from a form abandoned during a portal switch must not sign in.
    if (props.portal !== submittedPortal) { authService.logout(); return; }
    await router.replace({ name: 'feed' });
  } catch (err) {
    if (!request.signal.aborted && props.portal === submittedPortal) error.value = err.response?.data?.message || err.message || 'Unable to sign in.';
  } finally { if (loginRequest === request) { loginRequest = null; loading.value = false; } }
};
</script>
