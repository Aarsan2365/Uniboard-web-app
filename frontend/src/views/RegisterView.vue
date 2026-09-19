<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
    <!-- Ambient backgrounds -->
    <div class="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand-500/10 blur-[120px]"></div>
    <div class="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-violet-500/10 blur-[120px]"></div>

    <div class="w-full max-w-md bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-slide-up relative z-10">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">Create Account</h1>
        <p class="text-xs text-slate-400 mt-2">
          Role selection is exposed for demonstration purposes.
        </p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
          <input v-model="name" type="text" placeholder="John Doe" required class="w-full bg-slate-800/50 border border-slate-700/60 focus:border-brand-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all placeholder:text-slate-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
          <input v-model="email" type="email" placeholder="john.doe@campus.edu" required class="w-full bg-slate-800/50 border border-slate-700/60 focus:border-brand-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all placeholder:text-slate-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
          <input v-model="password" type="password" placeholder="•••••••• (6+ characters)" required minlength="6" class="w-full bg-slate-800/50 border border-slate-700/60 focus:border-brand-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all placeholder:text-slate-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Campus Role</label>
          <select v-model="role" class="w-full bg-slate-800/50 border border-slate-700/60 focus:border-brand-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all">
            <option value="student">Student</option>
            <option value="admin">Admin (Staff)</option>
          </select>
        </div>

        <!-- Batch selector — only relevant for students -->
        <div v-if="role === 'student'">
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Batch / Intake Year</label>
          <select v-model="batch" required class="w-full bg-slate-800/50 border border-slate-700/60 focus:border-brand-500 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all">
            <option value="" disabled>Select your batch year…</option>
            <option value="2021">Batch 2021</option>
            <option value="2022">Batch 2022</option>
            <option value="2023">Batch 2023</option>
            <option value="2024">Batch 2024</option>
            <option value="2025">Batch 2025</option>
          </select>
          <p class="text-[10px] text-slate-500 mt-1.5 pl-0.5">You will only see notices posted to your batch or to all batches.</p>
        </div>

        <p v-if="error" class="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 active:scale-[0.99] text-white text-sm font-semibold rounded-lg shadow-md shadow-brand-500/10 hover:shadow-lg hover:shadow-brand-500/20 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none mt-2"
        >
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <p class="text-xs text-slate-400 mt-6 text-center">
        Already have an account? <router-link to="/login" class="text-brand-400 hover:text-brand-300 font-medium transition-colors hover:underline">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
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

  // Students must pick a batch
  if (role.value === 'student' && !batch.value) {
    error.value = 'Please select your batch / intake year.';
    return;
  }

  loading.value = true;
  try {
    await authService.register(
      name.value,
      email.value,
      password.value,
      role.value,
      role.value === 'student' ? batch.value : undefined,
    );
    router.push({ name: 'feed' });
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
