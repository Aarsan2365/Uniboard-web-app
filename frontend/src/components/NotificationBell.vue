<!--
  components/NotificationBell.vue

  Polls the unread-count endpoint (derived from NoticeRead — see
  backend controllers/noticeController.js:getUnreadCount) every 30s
  and whenever `refreshKey` changes, so it updates right after the
  user reads a notice without waiting for the next poll.
-->
<template>
  <div class="relative flex items-center group cursor-pointer p-1.5 rounded-full hover:bg-slate-100/80 transition-colors">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500 group-hover:text-slate-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
      <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
    <span
      v-if="unreadCount > 0"
      class="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-extrabold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-sm shadow-rose-500/20 border border-white animate-pulse-subtle"
    >
      {{ unreadCount > 9 ? '9+' : unreadCount }}
    </span>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import noticeService from '../services/noticeService';

const props = defineProps({
  refreshKey: { type: Number, default: 0 },
});

const unreadCount = ref(0);
let intervalId = null;

const load = async () => {
  try {
    unreadCount.value = await noticeService.getUnreadCount();
  } catch {
    // Silently ignore — notification badge failing shouldn't break the page.
  }
};

watch(() => props.refreshKey, load);

onMounted(() => {
  load();
  intervalId = setInterval(load, 30000);
});
onUnmounted(() => clearInterval(intervalId));
</script>
