<template>
  <AppLayout>
    <div class="max-w-5xl mx-auto px-5 md:px-8 py-8 md:py-10 page-enter">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFD60A] text-[#0A0A0A] text-xs font-bold mb-4">
        <AppIcon name="bookmark" :size="14" /> Your Collection
      </div>
      <h1 class="text-3xl md:text-4xl font-black text-[var(--text-main)]">Saved Notices</h1>
      <p class="text-sm text-[var(--text-secondary)] mt-2 mb-7">Your bookmarked university announcements, saved to your account.</p>
      <p v-if="loading" class="text-[var(--text-secondary)]">Loading saved notices...</p>
      <div v-else-if="error" role="alert" class="rounded-xl border border-red-500/30 p-4 text-red-500">
        {{ error }} <button class="underline ml-2" @click="loadNotices">Retry</button>
      </div>
      <div v-else-if="notices.length === 0" class="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-10 text-center">
        <div class="mx-auto w-14 h-14 rounded-2xl bg-[#FFD60A] text-black flex items-center justify-center"><AppIcon name="bookmark" :size="26" /></div>
        <h2 class="font-bold text-lg mt-4">No saved notices yet</h2>
        <p class="text-sm text-[var(--text-secondary)] mt-2">Browse notices and select Save to build your collection.</p>
        <router-link to="/feed" class="premium-btn-primary mt-5">Browse Notices</router-link>
      </div>
      <div v-else class="space-y-5">
        <p class="text-xs text-[var(--text-secondary)]">{{ notices.length }} saved notice{{ notices.length === 1 ? '' : 's' }}</p>
        <NoticeCard v-for="notice in notices" :key="notice.id" :notice="notice" @saved-change="onSavedChange" />
      </div>
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import AppLayout from '../layouts/AppLayout.vue';
import AppIcon from '../components/AppIcon.vue';
import NoticeCard from '../components/NoticeCard.vue';
import noticeService from '../services/noticeService';
const notices = ref([]);
const loading = ref(false);
const error = ref('');
const loadNotices = async () => {
  loading.value = true;
  error.value = '';
  try { notices.value = (await noticeService.getSaved()).data || []; }
  catch (err) { error.value = err.response?.data?.message || 'Unable to load saved notices.'; }
  finally { loading.value = false; }
};
const onSavedChange = ({ id, isSaved }) => {
  if (!isSaved) notices.value = notices.value.filter(n => n.id !== id);
};
onMounted(loadNotices);
</script>
