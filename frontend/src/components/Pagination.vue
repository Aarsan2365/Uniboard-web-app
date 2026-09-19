<!--
  components/Pagination.vue

  Dumb component: shows current page / total pages and emits events,
  parent owns the actual page state and re-fetches.
-->
<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
    <button
      @click="$emit('change', page - 1)"
      :disabled="page <= 1"
      class="premium-btn-secondary py-1.5 px-3.5 !text-xs disabled:opacity-30 disabled:pointer-events-none"
    >
      Prev
    </button>
    <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Page {{ page }} of {{ totalPages }}</span>
    <button
      @click="$emit('change', page + 1)"
      :disabled="page >= totalPages"
      class="premium-btn-secondary py-1.5 px-3.5 !text-xs disabled:opacity-30 disabled:pointer-events-none"
    >
      Next
    </button>
  </div>
</template>

<script setup>
defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
});
defineEmits(['change']);
</script>
