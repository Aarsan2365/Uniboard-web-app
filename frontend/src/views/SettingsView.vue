<template>
  <AppLayout>
    <div class="max-w-3xl mx-auto px-5 md:px-8 py-8 md:py-10 page-enter">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFD60A] text-black text-xs font-bold mb-4"><AppIcon name="settings" :size="14" /> Account</div>
      <h1 class="text-3xl md:text-4xl font-black text-[var(--text-main)]">Profile & Settings</h1>
      <p class="text-sm text-[var(--text-secondary)] mt-2 mb-7">Review your account and customize the appearance.</p>
      <div class="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
        <div><p class="text-xs uppercase font-bold text-[var(--text-secondary)]">Name</p><p class="font-semibold mt-1">{{ user?.name || '-' }}</p></div>
        <div><p class="text-xs uppercase font-bold text-[var(--text-secondary)]">Email</p><p class="font-semibold mt-1 break-words">{{ user?.email || '-' }}</p></div>
        <div><p class="text-xs uppercase font-bold text-[var(--text-secondary)]">Role</p><p class="font-semibold capitalize mt-1">{{ user?.role || '-' }}</p></div>
        <div v-if="user?.batch && user.batch !== 'N/A'"><p class="text-xs uppercase font-bold text-[var(--text-secondary)]">Academic batch</p><p class="font-semibold mt-1">{{ user.batch }}</p></div>
        <div class="border-t border-[var(--border)] pt-5 flex items-center justify-between gap-4">
          <span class="text-sm font-semibold">Appearance: {{ isDark ? 'Dark' : 'Light' }} mode</span>
          <button class="premium-btn-primary" @click="toggleTheme"><AppIcon :name="isDark ? 'sun' : 'moon'" :size="17" /> Switch theme</button>
        </div>
      </div>
      <form @submit.prevent="save" class="mt-6 space-y-4 rounded-3xl border border-[var(--border)] p-6">
        <h2 class="font-bold">Update profile</h2>
        <label class="block">Name<input v-model.trim="profile.name" required maxlength="100" class="premium-input mt-2" /></label>
        <label v-if="user?.role === 'student'" class="block">Academic batch
          <select v-model="profile.batch" required class="premium-select mt-2">
            <option disabled value="">Select batch</option>
            <option v-for="year in ['2021','2022','2023','2024','2025','2026']" :key="year">{{ year }}</option>
          </select>
        </label>
        <p class="text-sm text-[var(--text-secondary)]">Your batch controls which announcements appear in your feed.</p>
        <p v-if="message" role="alert" class="text-red-500">{{ message }}</p>
        <button :disabled="saving" class="premium-btn-primary">{{ saving ? 'Saving...' : 'Save profile' }}</button>
      </form>
    </div>
  </AppLayout>
</template>
<script setup>
import { reactive, ref } from 'vue';
import AppLayout from '../layouts/AppLayout.vue';
import AppIcon from '../components/AppIcon.vue';
import authService from '../services/authService';
import { useTheme } from '../composables/useTheme';
const user = ref(authService.getCurrentUser());
const profile = reactive({ name: user.value?.name || '', batch: user.value?.batch || '' });
const message = ref('');
const saving = ref(false);
const save = async () => {
  if (saving.value) return;
  saving.value = true; message.value = '';
  try { user.value = await authService.updateProfile(profile); window.location.reload(); }
  catch (error) { message.value = error.response?.data?.message || error.message; }
  finally { saving.value = false; }
};
const { isDark, toggleTheme } = useTheme();
</script>
