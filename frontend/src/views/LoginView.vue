<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
    <!-- Ambient backgrounds -->
    <div class="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand-500/10 blur-[120px]"></div>
    <div class="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-violet-500/10 blur-[120px]"></div>
    
    <div class="w-full max-w-md bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-slide-up relative z-10">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 text-white font-bold text-xl mb-4 shadow-md shadow-brand-500/20">
          U
        </div>
        <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">UniBoard</h1>
        <p class="text-sm text-slate-400 mt-2">Digital Campus Notice Board</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="you@campus.edu"
            class="w-full bg-slate-800/50 border border-slate-700/60 focus:border-brand-500 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all placeholder:text-slate-500"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full bg-slate-800/50 border border-slate-700/60 focus:border-brand-500 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all placeholder:text-slate-500"
          />
        </div>

        <p v-if="error" class="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 active:scale-[0.99] text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-500/10 hover:shadow-lg hover:shadow-brand-500/20 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none mt-2"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="text-xs text-slate-400 mt-6 text-center">
        Don't have an account? <router-link to="/register" class="text-brand-400 hover:text-brand-300 font-medium transition-colors hover:underline">Create an account</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const router = useRouter();

const handleLogin = async () => {
  error.value = '';
  loading.value = true;
  try {
    await authService.login(email.value, password.value);
    router.push({ name: 'feed' });
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
