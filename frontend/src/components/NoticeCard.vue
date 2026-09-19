<!--
  components/NoticeCard.vue

  Displays one notice: category badge, optional image attachment,
  unread indicator, author/date, and a collapsible comment thread.
  Edit/Delete only render when `editable` is true (admin panel).
-->
<template>
  <div
    class="bg-white dark:bg-slate-900 rounded-2xl border p-6 transition-all duration-300 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] hover:-translate-y-0.5"
    :class="notice.isRead === false 
      ? 'border-l-4 border-l-brand-500 border-slate-200 dark:border-slate-700 shadow-[0_4px_16px_rgba(99,102,241,0.05)]' 
      : 'border-slate-200/80 dark:border-slate-800 shadow-sm'"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-2.5">
          <span 
            class="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
            :class="categoryClasses"
          >
            {{ notice.category }}
          </span>
          <!-- Batch target badge -->
          <span
            class="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
            :class="notice.targetBatch === 'All'
              ? 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200/50 dark:border-slate-700/50'
              : 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 border-teal-200/50 dark:border-teal-800/50'"
          >
            {{ notice.targetBatch === 'All' ? 'All Batches' : `Batch ${notice.targetBatch}` }}
          </span>
          <span
            v-if="notice.isRead === false"
            class="inline-block h-2 w-2 rounded-full bg-brand-500 animate-pulse-subtle"
            title="Unread Announcement"
          ></span>
        </div>
        <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">{{ notice.title }}</h3>
      </div>
      <span class="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-md px-2 py-1 whitespace-nowrap">{{ formattedDate }}</span>
    </div>

    <p class="text-slate-600 dark:text-slate-400 mt-3 whitespace-pre-line text-sm leading-relaxed">{{ notice.body }}</p>

    <!-- Image thumbnail — click to open full-screen lightbox -->
    <div
      v-if="notice.imageUrl"
      class="mt-4 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden max-h-64 shadow-inner bg-slate-50 dark:bg-slate-800 relative group cursor-zoom-in"
      @click="lightboxSrc = apiOrigin + notice.imageUrl"
    >
      <img
        :src="apiOrigin + notice.imageUrl"
        alt="Notice attachment"
        class="w-full max-h-64 object-cover group-hover:scale-[1.02] transition-transform duration-500"
      />
      <!-- Hover overlay hint -->
      <div class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors duration-300">
        <span class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
          View full image
        </span>
      </div>
    </div>

    <!-- Full-screen image lightbox -->
    <ImageLightbox
      :src="lightboxSrc"
      :caption="notice.title"
      @close="lightboxSrc = null"
    />

    <div class="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div class="flex items-center gap-2">
        <div class="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold uppercase">
          {{ notice.author?.name ? notice.author.name[0] : '?' }}
        </div>
        <span class="text-xs text-slate-500 dark:text-slate-400">Posted by <span class="font-medium text-slate-700 dark:text-slate-300">{{ notice.author?.name || 'Unknown' }}</span></span>
      </div>

      <div class="flex items-center gap-4">
        <button 
          @click="showComments = !showComments" 
          class="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {{ showComments ? 'Hide comments' : 'Comments' }}
        </button>

        <template v-if="editable">
          <span class="h-3 w-px bg-slate-200 dark:bg-slate-700"></span>
          <button @click="$emit('show-reads', notice)" class="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800">
            Read Receipts
          </button>
          <button @click="$emit('edit', notice)" class="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors px-2 py-1 rounded-md hover:bg-brand-50 dark:hover:bg-brand-950">Edit</button>
          <button @click="$emit('delete', notice)" class="text-xs font-bold text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950">Delete</button>
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

const props = defineProps({
  notice: { type: Object, required: true },
  editable: { type: Boolean, default: false },
});

defineEmits(['edit', 'delete', 'show-reads']);

const showComments = ref(false);
const lightboxSrc  = ref(null);

// Images are served from the backend (localhost:5000), not the
// frontend dev server (localhost:5173), so we need the full origin.
const apiOrigin = 'http://localhost:5000';

const formattedDate = computed(() =>
  new Date(props.notice.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
);

// Map categories to high-contrast desaturated color combinations
const categoryClasses = computed(() => {
  const c = props.notice.category;
  switch (c) {
    case 'Exam Schedules':
      return 'text-amber-700 bg-amber-50 border-amber-200/50';
    case 'Sports':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200/50';
    case 'Academic':
      return 'text-blue-700 bg-blue-50 border-blue-200/50';
    case 'Events':
      return 'text-violet-700 bg-violet-50 border-violet-200/50';
    case 'General':
    default:
      return 'text-slate-600 bg-slate-100 border-slate-200/50';
  }
});
</script>
