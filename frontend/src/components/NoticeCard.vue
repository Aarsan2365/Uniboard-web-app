<template>
  <div
    class="rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FFD60A]/50"
    :class="notice.isRead === false ? 'border-l-4 border-l-[#FFD60A] border-[var(--border)] bg-[var(--surface)]' : 'border-[var(--border)] bg-[var(--surface)]'"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="flex flex-wrap items-center gap-2 mb-2.5">
          <span class="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border" :class="categoryClasses">{{ notice.category }}</span>
          <span class="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-secondary)]">
            {{ notice.targetBatch === 'All' ? 'All Batches' : `Batch ${notice.targetBatch}` }}
          </span>
          <span v-if="notice.isRead === false" class="inline-block h-2 w-2 rounded-full bg-[#FFD60A] animate-pulse-subtle" title="Unread Announcement"></span>
        </div>
        <h3 class="text-xl font-bold text-[var(--text-main)] tracking-tight leading-snug">{{ notice.title }}</h3>
      </div>
      <span class="text-xs font-semibold text-[var(--text-secondary)] bg-[var(--surface-soft)] border border-[var(--border)] rounded-md px-2 py-1 whitespace-nowrap">{{ formattedDate }}</span>
    </div>

    <p class="text-[var(--text-secondary)] mt-3 whitespace-pre-line text-sm leading-relaxed">{{ notice.body }}</p>

    <div v-if="notice.imageUrl" class="mt-4 rounded-xl border border-[var(--border)] overflow-hidden max-h-64 shadow-inner bg-[var(--surface-soft)] relative group cursor-zoom-in" @click="lightboxSrc = apiOrigin + notice.imageUrl">
      <img :src="apiOrigin + notice.imageUrl" alt="Notice attachment" class="w-full max-h-64 object-cover group-hover:scale-[1.02] transition-transform duration-500" />
      <div class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-300">
        <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full">View full image</span>
      </div>
    </div>

    <ImageLightbox :src="lightboxSrc" :caption="notice.title" @close="lightboxSrc = null" />

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-[var(--border)]">
      <div class="flex items-center gap-2">
        <div class="h-7 w-7 rounded-full bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center text-[10px] font-bold uppercase">{{ notice.author?.name ? notice.author.name[0] : '?' }}</div>
        <span class="text-xs text-[var(--text-secondary)]">Posted by <span class="font-medium text-[var(--text-main)]">{{ notice.author?.name || 'Unknown' }}</span></span>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button type="button" @click="showComments = !showComments" class="action-btn">{{ showComments ? 'Hide comments' : 'Comments' }}</button>
        <template v-if="editable">
          <button type="button" @click="$emit('show-reads', notice)" class="action-btn">Read Receipts</button>
          <button type="button" @click="$emit('edit', notice)" class="action-btn text-[#8A7200] dark:text-[#FFD60A]">Edit</button>
          <button type="button" @click="$emit('delete', notice)" class="action-btn text-red-500">Delete</button>
        </template>
      </div>
    </div>

    <CommentSection v-if="showComments" :notice-id="notice.id" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import CommentSection from './CommentSection.vue';
import ImageLightbox from './ImageLightbox.vue';

const props = defineProps({ notice: { type: Object, required: true }, editable: { type: Boolean, default: false } });
defineEmits(['edit', 'delete', 'show-reads']);
const showComments = ref(false);
const lightboxSrc = ref(null);
const apiOrigin = import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000';
const formattedDate = computed(() => new Date(props.notice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
const categoryClasses = computed(() => {
  const c = props.notice.category;
  if (c === 'Exam Schedules') return 'text-amber-800 bg-amber-100 border-amber-300/70';
  if (c === 'Sports') return 'text-emerald-800 bg-emerald-100 border-emerald-300/70';
  if (c === 'Academic') return 'text-sky-800 bg-sky-100 border-sky-300/70';
  if (c === 'Events') return 'text-fuchsia-800 bg-fuchsia-100 border-fuchsia-300/70';
  return 'text-[#0A0A0A] bg-[#FFD60A] border-[#FFD60A]';
});
</script>

<style scoped>
.action-btn { @apply text-xs font-bold px-2 py-1 rounded-md transition-colors; color: var(--text-secondary); }
.action-btn:hover { background: var(--surface-hover); color: #8a7200; }
.dark .action-btn:hover { color: #ffd60a; }
</style>
