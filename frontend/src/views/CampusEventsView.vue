<template>
  <AppLayout>
    <div class="max-w-5xl mx-auto px-5 md:px-8 py-8 md:py-10 page-enter">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFD60A] text-[#0A0A0A] text-xs font-bold mb-4"><AppIcon name="calendar" :size="14" /> University Calendar</div>
      <h1 class="text-3xl md:text-4xl font-black text-[var(--text-main)]">University Events</h1>
      <p class="text-sm text-[var(--text-secondary)] mt-2 mb-7">Upcoming university events, sorted by schedule.</p>
      <p v-if="loading" class="text-[var(--text-secondary)]">Loading events...</p>
      <div v-else-if="error" role="alert" class="rounded-xl border border-red-500/30 p-4 text-red-500">
        {{ error }} <button class="underline ml-2" @click="loadEvents">Retry</button>
      </div>
      <div v-else-if="events.length === 0" class="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-10 text-center">
        <div class="mx-auto w-14 h-14 rounded-2xl bg-[#FFD60A] text-black flex items-center justify-center"><AppIcon name="calendar" :size="26" /></div>
        <h2 class="font-bold text-lg mt-4">No upcoming events</h2>
        <p class="text-sm text-[var(--text-secondary)] mt-2">New events will appear here when administrators schedule them.</p>
      </div>
      <div v-else class="space-y-5">
        <NoticeCard v-for="event in events" :key="event.id" :notice="event" @saved-change="onSavedChange" />
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
const events = ref([]);
const loading = ref(false);
const error = ref('');
const loadEvents = async () => {
  loading.value = true;
  error.value = '';
  try { events.value = (await noticeService.getUpcomingEvents()).data || []; }
  catch (err) { error.value = err.response?.data?.message || 'Unable to load University events.'; }
  finally { loading.value = false; }
};
const onSavedChange = ({ id, isSaved }) => {
  events.value = events.value.map(event => event.id === id ? { ...event, isSaved } : event);
};
onMounted(loadEvents);
</script>
