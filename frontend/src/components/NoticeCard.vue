<template>
  <article
    :data-notice-id="notice.id"
    class="rounded-2xl border p-4 sm:p-6 transition-colors duration-200 hover:border-[#FFD60A]/50"
    :class="read ? 'border-[var(--border)] bg-[var(--surface)]' : 'border-l-4 border-l-[#FFD60A] border-[var(--border)] bg-[var(--surface)]'"
  >
    <div class="flex flex-col sm:flex-row items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2 mb-2.5">
          <span class="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border" :class="categoryClasses">{{ notice.category }}</span>
          <span class="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-secondary)]">
            {{ !notice.targetBatch || notice.targetBatch === 'All' ? 'All Batches' : `Batch ${notice.targetBatch}` }}
          </span>
          <span v-if="!read" class="inline-block h-2 w-2 rounded-full bg-[#FFD60A]" title="Unread notice"></span>
        </div>
        <h2 v-if="detail" class="text-2xl font-black text-[var(--text-main)] leading-snug break-words">{{ notice.title }}</h2>
        <h3 v-else class="text-xl font-bold text-[var(--text-main)] leading-snug break-words"><router-link :to="`/notices/${notice.id}`" class="hover:underline">{{ notice.title }}</router-link></h3>
      </div>
      <span class="text-xs font-semibold text-[var(--text-secondary)] bg-[var(--surface-soft)] border border-[var(--border)] rounded-md px-2 py-1 whitespace-nowrap">{{ formattedDate }}</span>
    </div>

    <div v-if="notice.category === 'Events' && notice.eventDate" class="flex flex-wrap gap-4 mt-3 text-xs font-semibold text-[var(--text-secondary)]">
      <span class="inline-flex items-center gap-1"><AppIcon name="calendar" :size="14" />{{ formattedEventDate }}</span>
      <span v-if="notice.eventLocation">{{ notice.eventLocation }}</span>
    </div>
    <div v-if="notice.imageUrl" class="mt-4 rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface-soft)]">
      <button v-if="!imageFailed" type="button" class="block w-full cursor-zoom-in" :aria-label="`View full image: ${notice.title}`" @click="lightboxSrc = imageUrl">
        <img :src="imageUrl" :alt="`Poster for ${notice.title}`" loading="lazy" class="w-full object-contain" :class="detail ? 'max-h-[70vh]' : 'max-h-[420px]'" @error="imageFailed = true" />
        <span class="block px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] border-t border-[var(--border)]">View full image · Zoom to read the poster</span>
      </button>
      <p v-else role="status" class="px-4 py-6 text-sm text-[var(--text-secondary)]">This attachment could not load. The announcement text is available below.</p>
    </div>
    <NoticePdfAttachment v-if="notice.pdfUrl" :notice="notice" class="mt-4" />
    <p class="text-[var(--text-secondary)] mt-4 whitespace-pre-line break-words text-sm leading-relaxed" :class="{ 'line-clamp-3': !detail }">{{ notice.body }}</p>
    <router-link v-if="!detail" :to="`/notices/${notice.id}`" class="inline-flex mt-3 text-sm font-bold text-[#8A7200] dark:text-[#FFD60A] hover:underline">Open notice →</router-link>
    <ImageLightbox :src="lightboxSrc" :caption="notice.title" @close="lightboxSrc = null" />
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-[var(--border)]">
      <div class="flex items-center gap-2">
        <div class="h-7 w-7 rounded-full bg-[#FFD60A] text-[#0A0A0A] flex items-center justify-center text-[10px] font-bold uppercase">{{ notice.author?.name?.charAt(0) || '?' }}</div>
        <span class="text-xs text-[var(--text-secondary)]">Posted by <span class="font-medium text-[var(--text-main)]">{{ notice.author?.name || 'Unknown' }}</span></span>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <button type="button" class="action-btn flex items-center gap-1" :disabled="saving" :aria-pressed="saved" @click="toggleSave">
          <AppIcon name="bookmark" :size="15" /> {{ saved ? 'Unsave' : 'Save' }}
        </button>
        <button v-if="!read" type="button" class="action-btn" :disabled="markingRead" @click="markRead">
          {{ markingRead ? 'Updating...' : 'Mark as read' }}
        </button>
        <button type="button" class="action-btn" @click="showComments = !showComments">{{ showComments ? 'Hide comments' : 'Comments' }}</button>
        <template v-if="editable">
          <button type="button" class="action-btn" @click="$emit('show-reads', notice)">Read Receipts</button>
          <button type="button" class="action-btn text-[#8A7200] dark:text-[#FFD60A]" @click="$emit('edit', notice)">Edit</button>
          <button type="button" class="action-btn text-red-500" @click="$emit('delete', notice)">Delete</button>
        </template>
      </div>
    </div>
    <p v-if="actionError" role="alert" class="mt-2 text-xs text-red-500">{{ actionError }}</p>
    <CommentSection v-if="showComments" :notice-id="notice.id" />
  </article>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import AppIcon from './AppIcon.vue';
import CommentSection from './CommentSection.vue';
import ImageLightbox from './ImageLightbox.vue';
import NoticePdfAttachment from './NoticePdfAttachment.vue';
import noticeService from '../services/noticeService';
import { resolveImageUrl } from '../services/imageUrl';

const props = defineProps({
  notice: { type: Object, required: true },
  editable: { type: Boolean, default: false },
  detail: { type: Boolean, default: false }
});
const emit = defineEmits(['edit', 'delete', 'show-reads', 'saved-change', 'read-change']);
const saved = ref(Boolean(props.notice.isSaved));
const read = ref(Boolean(props.notice.isRead));
const saving = ref(false);
const markingRead = ref(false);
const actionError = ref('');
const showComments = ref(props.detail);
const lightboxSrc = ref(null);
const imageFailed = ref(false);
watch(() => props.notice.imageUrl, () => { imageFailed.value = false; });

watch(() => props.notice.isSaved, value => { saved.value = Boolean(value); });
watch(() => props.notice.isRead, value => { read.value = Boolean(value); });

const toggleSave = async () => {
  if (saving.value) return;
  saving.value = true;
  actionError.value = '';
  try {
    if (saved.value) await noticeService.unsave(props.notice.id);
    else await noticeService.save(props.notice.id);
    saved.value = !saved.value;
    emit('saved-change', { id: props.notice.id, isSaved: saved.value });
  } catch (error) {
    actionError.value = error.response?.data?.message || 'Unable to update saved notices.';
  } finally { saving.value = false; }
};
const markRead = async () => {
  if (markingRead.value) return;
  markingRead.value = true;
  actionError.value = '';
  try {
    await noticeService.markAsRead(props.notice.id);
    read.value = true;
    emit('read-change', { id: props.notice.id });
  } catch (error) {
    actionError.value = error.response?.data?.message || 'Unable to mark this notice as read.';
  } finally { markingRead.value = false; }
};
const imageUrl = computed(() => resolveImageUrl(props.notice.imageUrl));
const formattedDate = computed(() => new Date(props.notice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));
const formattedEventDate = computed(() => props.notice.eventDate ? new Date(props.notice.eventDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not scheduled');
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
.action-btn:disabled { opacity: .6; cursor: wait; }
.dark .action-btn:hover { color: #ffd60a; }
</style>
