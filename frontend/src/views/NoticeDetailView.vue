<template>
  <AppLayout :notification-refresh-key="refreshKey">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <router-link to="/feed" class="premium-btn-secondary">← Back to notices</router-link>
        <router-link v-if="user?.role === 'admin'" to="/admin" class="premium-btn-primary">Manage announcements</router-link>
      </div>
      <p v-if="loading" role="status" class="py-10">Loading notice...</p>
      <div v-else-if="error" role="alert" class="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"><h1 class="text-xl font-bold">Notice unavailable</h1><p class="mt-2 text-[var(--text-secondary)]">{{ error }}</p><button class="premium-btn-secondary mt-4" @click="load">Try again</button></div>
      <template v-else-if="notice">
        <h1 class="sr-only">{{ notice.title }} — Notice details</h1>
        <NoticeCard :key="notice.id" :notice="notice" detail @saved-change="({ isSaved }) => notice.isSaved = isSaved" @read-change="markRead" />
      </template>
    </div>
  </AppLayout>
</template>
<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '../layouts/AppLayout.vue';
import NoticeCard from '../components/NoticeCard.vue';
import noticeService from '../services/noticeService';
import authService from '../services/authService';
const route = useRoute();
const user = computed(() => authService.getCurrentUser());
const notice = ref(null), loading = ref(false), error = ref(''), refreshKey = ref(0);
let requestNumber = 0;
const load = async () => {
  const request = ++requestNumber; loading.value = true; error.value = '';
  try { const data = await noticeService.getById(route.params.id); if (request === requestNumber) notice.value = data; }
  catch (err) { if (request === requestNumber) error.value = err.response?.data?.message || err.message || 'Unable to load this notice.'; }
  finally { if (request === requestNumber) loading.value = false; }
};
const markRead = () => { notice.value.isRead = true; refreshKey.value++; };
watch(() => route.params.id, load, { immediate: true });
</script>
