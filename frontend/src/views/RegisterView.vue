<template>
  <div class="min-h-screen bg-[var(--app-bg)] flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-[500px] bg-[var(--surface)] border border-[var(--border)] rounded-[28px] p-6 sm:p-8 shadow-xl">
      <div class="text-center mb-7">
        <div class="mx-auto w-14 h-14 rounded-2xl bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center"><AppIcon name="graduation" :size="27" /></div>
        <h1 class="text-2xl font-black mt-5">Create student account</h1>
        <p class="text-sm text-[var(--text-secondary)] mt-2">Register with your academic batch to receive relevant campus notices.</p>
      </div>
      <form class="space-y-4" @submit.prevent="handleRegister">
        <div><label for="register-name" class="field-label">Full name</label><input id="register-name" v-model.trim="name" type="text" autocomplete="name" required maxlength="100" placeholder="Your full name" class="premium-input" /></div>
        <div><label for="register-email" class="field-label">Email address</label><input id="register-email" v-model.trim="email" type="email" autocomplete="email" required placeholder="you@campus.edu" class="premium-input" /></div>
        <div><label for="register-password" class="field-label">Password</label><input id="register-password" v-model="password" type="password" autocomplete="new-password" required minlength="8" placeholder="At least 8 characters" class="premium-input" /></div>
        <div><label for="confirm-password" class="field-label">Confirm password</label><input id="confirm-password" v-model="confirmPassword" type="password" autocomplete="new-password" required minlength="8" placeholder="Re-enter your password" class="premium-input" /></div>
        <div>
          <label for="register-batch" class="field-label">Batch / intake year</label>
          <select id="register-batch" v-model="batch" required class="premium-select">
            <option value="" disabled>Select your batch year…</option>
            <option v-for="year in ['2021','2022','2023','2024','2025','2026']" :key="year" :value="year">Batch {{ year }}</option>
          </select>
        </div>
        <p v-if="error" role="alert" class="text-sm text-red-700 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">{{ error }}</p>
        <button type="submit" :disabled="loading" class="premium-btn-primary w-full py-3.5">{{ loading ? 'Creating account...' : 'Create student account' }}</button>
      </form>
      <p class="text-sm text-center text-[var(--text-secondary)] mt-6">Already registered? <router-link to="/login" class="font-bold text-[#8A7200] dark:text-[#FFD60A] hover:underline">Student Login</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppIcon from '../components/AppIcon.vue';
import authService from '../services/authService';

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const batch = ref('');
const error = ref('');
const loading = ref(false);
const router = useRouter();
let registerRequest = null;
onBeforeUnmount(() => registerRequest?.abort());

const handleRegister = async () => {
  if (loading.value) return;
  error.value = '';
  if (password.value !== confirmPassword.value) { error.value = 'Passwords do not match.'; return; }
  if (!batch.value) { error.value = 'Please select your batch / intake year.'; return; }
  loading.value = true;
  const request = new AbortController();
  registerRequest = request;
  try {
    await authService.register(name.value, email.value, password.value, batch.value, { signal: request.signal });
    if (request.signal.aborted) return;
    await router.replace({ name: 'login', query: { registered: '1' } });
  } catch (err) { if (!request.signal.aborted) error.value = err.response?.data?.message || err.message || 'Registration failed. Please try again.'; }
  finally { loading.value = false; }
};
</script>
<style scoped>
.field-label { @apply block text-xs font-bold uppercase tracking-wider mb-2; color: var(--text-secondary); }
</style>
