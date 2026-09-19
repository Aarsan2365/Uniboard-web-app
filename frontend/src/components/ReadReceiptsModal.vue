<!--
  components/ReadReceiptsModal.vue

  Simple modal showing who has read a given notice, admin-only.
  Fetches lazily when opened (v-if on the parent controls mount/unmount).
-->
<template>
  <div class="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in" @click.self="$emit('close')">
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/85 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 animate-slide-up">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <h3 class="font-bold text-slate-800 dark:text-slate-100 tracking-tight text-base">Read Receipts ({{ count }})</h3>
        <button @click="$emit('close')" class="h-6 w-6 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center justify-center text-sm transition-colors">✕</button>
      </div>

      <p v-if="loading" class="text-xs text-slate-400 animate-pulse py-4 text-center">Loading receipt logs...</p>
      <ul v-else-if="readers.length" class="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        <li v-for="r in readers" :key="r.id" class="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 px-3 py-2 rounded-lg">
          <div class="flex items-center gap-2">
            <div class="h-5 w-5 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-[9px] font-bold uppercase">
              {{ r.name[0] }}
            </div>
            <span class="font-semibold text-slate-700">{{ r.name }}</span>
          </div>
          <span class="text-slate-400 dark:text-slate-500 font-medium text-[10px]">{{ new Date(r.readAt).toLocaleDateString('en-GB') }}</span>
        </li>
      </ul>
      <div v-else class="text-center py-6">
        <p class="text-xs text-slate-400 dark:text-slate-500">No read receipts logged for this notice.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import noticeService from '../services/noticeService';

const props = defineProps({
  noticeId: { type: [Number, String], required: true },
});
defineEmits(['close']);

const readers = ref([]);
const count = ref(0);
const loading = ref(true);

onMounted(async () => {
  try {
    const result = await noticeService.getReadReceipts(props.noticeId);
    readers.value = result.readers;
    count.value = result.count;
  } finally {
    loading.value = false;
  }
});
</script>
