<template>
  <div class="min-h-screen bg-[var(--app-bg)] flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-xl">
      <div class="text-center">
        <div class="mx-auto w-14 h-14 rounded-2xl bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center"><AppIcon name="lock" :size="26" /></div>
        <h1 class="text-2xl font-black mt-5">Create New Password</h1>
        <p class="text-sm text-[var(--text-secondary)] mt-2">Enter your new UniBoard password.</p>
      </div>

      <form class="mt-7 space-y-5" @submit.prevent="handleResetPassword">
        <div>
          <label class="block text-sm font-bold text-[var(--text-secondary)]">New Password</label>
          <div class="relative mt-2">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" required minlength="6" class="premium-input pr-12" />
            <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" @click="showPassword = !showPassword"><AppIcon :name="showPassword ? 'eye-off' : 'eye'" :size="18" /></button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-bold text-[var(--text-secondary)]">Confirm Password</label>
          <input v-model="confirmPassword" type="password" required minlength="6" class="premium-input mt-2" />
        </div>
        <p v-if="error" class="text-sm text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{{ error }}</p>
        <p v-if="message" class="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">{{ message }}</p>
        <button type="submit" :disabled="loading" class="premium-btn-primary w-full py-3">{{ loading ? 'Updating password...' : 'Set New Password' }}</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppIcon from '../components/AppIcon.vue';
import authService from '../services/authService';

const route = useRoute();
const router = useRouter();
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');
const message = ref('');

const handleResetPassword = async () => {
  error.value = '';
  message.value = '';
  if (password.value.length < 6) { error.value = 'Password must contain at least 6 characters.'; return; }
  if (password.value !== confirmPassword.value) { error.value = 'Passwords do not match.'; return; }
  loading.value = true;
  try {
    const result = await authService.resetPassword(route.params.token, password.value);
    message.value = result.message;
    setTimeout(() => router.replace('/login'), 1200);
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to reset password. The link may have expired.';
  } finally {
    loading.value = false;
  }
};
</script>
