<template>
  <div class="min-h-screen bg-[var(--app-bg)] flex items-center justify-center px-4 py-10 transition-colors duration-300">
    <div class="w-full max-w-[500px] bg-[var(--surface)] border border-[var(--border)] rounded-[28px] p-8 shadow-xl">
      <div class="text-center mb-7">
        <div class="mx-auto w-14 h-14 rounded-2xl bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center">
          <AppIcon name="user" :size="27" />
        </div>
        <h1 class="text-3xl font-black mt-5">Create Account</h1>
        <p class="text-sm text-[var(--text-secondary)] mt-2">Join the UniBoard campus notice system.</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleRegister">
        <div><label class="field-label">Full Name</label><input v-model="name" type="text" required placeholder="Your full name" class="premium-input" /></div>
        <div><label class="field-label">Email Address</label><input v-model="email" type="email" required placeholder="you@campus.edu" class="premium-input" /></div>
        <div><label class="field-label">Password</label><input v-model="password" type="password" required minlength="6" placeholder="6+ characters" class="premium-input" /></div>
        <div>
          <label class="field-label">Campus Role</label>
          <select v-model="role" class="premium-select">
            <option value="student">Student</option>
            <option value="admin">Admin (Staff)</option>
          </select>
        </div>
        <div v-if="role === 'student'">
          <label class="field-label">Batch / Intake Year</label>
          <select v-model="batch" required class="premium-select">
            <option value="" disabled>Select your batch year…</option>
            <option v-for="year in ['2021','2022','2023','2024','2025']" :key="year" :value="year">Batch {{ year }}</option>
          </select>
        </div>

        <p v-if="error" class="text-sm text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">{{ error }}</p>
        <button type="submit" :disabled="loading" class="premium-btn-primary w-full py-3.5">{{ loading ? 'Creating account...' : 'Create Account' }}</button>
      </form>

      <p class="text-sm text-center text-[var(--text-secondary)] mt-6">Already have an account? <router-link to="/login" class="font-bold text-[#8A7200] dark:text-[#FFD60A] hover:underline">Sign in</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppIcon from '../components/AppIcon.vue';
import authService from '../services/authService';

const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('student');
const batch = ref('');
const error = ref('');
const loading = ref(false);
const router = useRouter();

const handleRegister = async () => {
  error.value = '';
  if (role.value === 'student' && !batch.value) {
    error.value = 'Please select your batch / intake year.';
    return;
  }
  loading.value = true;
  try {
    await authService.register(name.value, email.value, password.value, role.value, role.value === 'student' ? batch.value : undefined);
    await router.replace({ name: 'dashboard' });
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.field-label { @apply block text-xs font-bold uppercase tracking-wider mb-2; color: var(--text-secondary); }
</style>
