<template>
  <div class="relative min-h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--text-main)] flex items-center justify-center px-4 py-10 transition-colors duration-300">
    <div class="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#FFD60A]/10 rounded-full blur-[150px]"></div>
    <div class="relative z-10 w-full max-w-[460px] bg-[var(--surface)] border border-[var(--border)] rounded-[28px] px-8 py-10 shadow-xl">
      <div class="text-center">
        <div class="mx-auto w-14 h-14 rounded-2xl bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center shadow-lg shadow-yellow-400/10">
          <AppIcon name="graduation" :size="28" />
        </div>
        <h1 class="text-3xl font-black text-[var(--text-main)] mt-5">UniBoard</h1>
        <p class="text-sm text-[var(--text-secondary)] mt-2">Digital Campus Notice Board</p>
      </div>

      <form class="mt-8 space-y-5" @submit.prevent="handleLogin">
        <div>
          <label class="block text-xs font-bold tracking-wider text-[var(--text-secondary)] uppercase mb-2">Email Address</label>
          <div class="relative">
            <AppIcon name="mail" :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input v-model="email" type="email" required placeholder="you@campus.edu" class="premium-input pl-11" />
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-bold tracking-wider text-[var(--text-secondary)] uppercase">Password</label>
            <router-link to="/forgot-password" class="text-xs font-semibold text-[#8A7200] dark:text-[#FFD60A] hover:underline">Forgot password?</router-link>
          </div>
          <div class="relative">
            <AppIcon name="lock" :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input v-model="password" :type="showPassword ? 'text' : 'password'" required placeholder="Enter your password" class="premium-input pl-11 pr-12" />
            <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[#8A7200] dark:hover:text-[#FFD60A]" @click="showPassword = !showPassword">
              <AppIcon :name="showPassword ? 'eye-off' : 'eye'" :size="18" />
            </button>
          </div>
        </div>

        <p v-if="error" class="text-sm text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">{{ error }}</p>
        <button type="submit" :disabled="loading" class="premium-btn-primary w-full py-3.5">
          {{ loading ? 'Signing in...' : 'Sign In' }} <AppIcon v-if="!loading" name="arrow-right" :size="18" />
        </button>
      </form>

      <div class="flex items-center gap-4 my-7"><div class="flex-1 h-px bg-[var(--border)]"></div><span class="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">New to UniBoard?</span><div class="flex-1 h-px bg-[var(--border)]"></div></div>
      <router-link to="/register" class="premium-btn-secondary w-full">Create an account</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppIcon from '../components/AppIcon.vue';
import authService from '../services/authService';

const router = useRouter();
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    await authService.login(email.value.trim(), password.value);
    await router.replace({ name: 'dashboard' });
  } catch (err) {
    error.value = !err.response
      ? 'Cannot connect to the server. Make sure the backend is running.'
      : (err.response?.data?.message || 'Invalid email or password.');
  } finally {
    loading.value = false;
  }
};
</script>
