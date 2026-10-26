<template>
  <div class="min-h-screen bg-[var(--app-bg)] flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-xl">
      <div class="text-center">
        <div class="mx-auto w-14 h-14 rounded-2xl bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center"><AppIcon name="key" :size="26" /></div>
        <h1 class="text-2xl font-black mt-5">Forgot Password?</h1>
        <p class="text-sm text-[var(--text-secondary)] mt-2">Enter your registered email address to create a reset link.</p>
      </div>

      <form class="mt-7" @submit.prevent="submitRequest">
        <label class="block text-sm font-bold text-[var(--text-secondary)]">Email Address</label>
        <input v-model="email" type="email" required placeholder="student@example.com" class="premium-input mt-2" />
        <p v-if="message" class="mt-4 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">{{ message }}</p>
        <p v-if="error" class="mt-4 text-sm text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{{ error }}</p>

        <div v-if="devResetUrl" class="mt-4 text-xs bg-[var(--surface-soft)] border border-[var(--border)] p-3 rounded-xl break-all">
          <p class="font-bold mb-1">Development reset link:</p>
          <a :href="devResetUrl" class="text-[#8A7200] dark:text-[#FFD60A] underline">{{ devResetUrl }}</a>
        </div>

        <button type="submit" :disabled="loading" class="premium-btn-primary w-full mt-6 py-3">{{ loading ? 'Creating reset link...' : 'Reset Password' }}</button>
        <router-link to="/login" class="block text-center text-sm text-[#8A7200] dark:text-[#FFD60A] font-semibold mt-5 hover:underline">Back to Login</router-link>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppIcon from '../components/AppIcon.vue';
import authService from '../services/authService';

const email = ref('');
const loading = ref(false);
const message = ref('');
const error = ref('');
const devResetUrl = ref('');

const submitRequest = async () => {
  message.value = '';
  error.value = '';
  devResetUrl.value = '';
  loading.value = true;
  try {
    const result = await authService.forgotPassword(email.value.trim());
    message.value = result.message;
    devResetUrl.value = result.resetUrl || '';
  } catch (err) {
    error.value = err.response?.data?.message || 'Unable to create password reset request.';
  } finally {
    loading.value = false;
  }
};
</script>
