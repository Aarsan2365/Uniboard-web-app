<template>
  <div class="relative flex items-center group cursor-pointer p-2 rounded-xl hover:bg-[var(--surface-hover)] transition-colors">
    <AppIcon name="bell" :size="19" class="text-[var(--text-secondary)] group-hover:text-[#8A7200] dark:group-hover:text-[#FFD60A] transition-colors" />
    <span
      v-if="unreadCount > 0"
      class="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-extrabold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-sm border border-[var(--header-bg)] animate-pulse-subtle"
    >
      {{ unreadCount > 9 ? '9+' : unreadCount }}
    </span>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import AppIcon from './AppIcon.vue';
import noticeService from '../services/noticeService';

const props = defineProps({ refreshKey: { type: Number, default: 0 } });
const unreadCount = ref(0);
let intervalId = null;
const load = async () => {
  try { unreadCount.value = await noticeService.getUnreadCount(); } catch { /* non-blocking */ }
};
watch(() => props.refreshKey, load);
onMounted(() => { load(); intervalId = setInterval(load, 30000); });
onUnmounted(() => clearInterval(intervalId));
</script>
