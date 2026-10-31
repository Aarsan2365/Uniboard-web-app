<template>
  <form @submit.prevent="handleSubmit" class="rounded-2xl border border-[var(--border)] p-4 sm:p-6 space-y-5">
    <h3 class="text-lg font-bold">{{ initialNotice ? 'Edit announcement' : 'Post new announcement' }}</h3>
    <fieldset :disabled="submitting" class="space-y-5 min-w-0">
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label for="notice-title" class="field-label">Title</label>
          <input id="notice-title" v-model.trim="form.title" maxlength="150" type="text" required class="premium-input" placeholder="e.g. Final Exam Timetable Released" />
        </div>
        <div>
          <label for="notice-category" class="field-label">Announcement category</label>
          <select id="notice-category" v-model="form.category" class="premium-select">
            <option v-for="category in categories" :key="category">{{ category }}</option>
          </select>
        </div>
      </div>
      <div v-if="form.category === 'Events'" class="grid md:grid-cols-2 gap-4">
        <div><label for="event-date" class="field-label">Event date and time</label><input id="event-date" v-model="form.eventDate" type="datetime-local" required class="premium-input" /></div>
        <div><label for="event-location" class="field-label">Event location</label><input id="event-location" v-model.trim="form.eventLocation" type="text" maxlength="160" required class="premium-input" placeholder="e.g. Main Auditorium" /></div>
      </div>
      <div>
        <span id="audience-label" class="field-label">Target batch</span>
        <div role="group" aria-labelledby="audience-label" class="flex flex-wrap gap-2">
          <button v-for="batch in batches" :key="batch" type="button" :aria-pressed="form.targetBatch === batch" @click="form.targetBatch = batch"
            :class="['px-3 py-2 rounded-full text-xs font-bold border transition-colors', form.targetBatch === batch ? 'bg-[#FFD60A] text-[#0A0A0A] border-[#FFD60A]' : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-secondary)]']">
            {{ batch === 'All' ? 'All Batches' : `Batch ${batch}` }}
          </button>
        </div>
        <p class="text-xs text-[var(--text-secondary)] mt-2">All Batches reaches every student. A year reaches only that cohort.</p>
      </div>
      <div>
        <label for="notice-body" class="field-label">Announcement content</label>
        <textarea id="notice-body" v-model.trim="form.body" maxlength="10000" required rows="5" class="premium-input" placeholder="Type full announcement text here..."></textarea>
        <p class="text-right text-xs text-[var(--text-muted)] mt-1">{{ form.body.length }} / 10,000</p>
      </div>
      <div>
        <label for="notice-image" class="field-label">Image attachment (optional)</label>
        <input id="notice-image" ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" @change="handleFileChange" class="premium-input text-sm" />
        <p class="text-xs text-[var(--text-secondary)] mt-2">Upload a notice poster or photo. JPEG, PNG, WebP or GIF, up to {{ attachmentMaxMB }} MB.</p>
        <p v-if="imageError" role="alert" class="text-sm text-red-500 mt-2">{{ imageError }} <button type="button" class="underline" @click="clearSelection">Clear selection</button></p>
        <div v-if="previewUrl" class="mt-3 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-soft)]">
          <img :src="previewUrl" alt="Announcement image preview" class="w-full max-h-80 object-contain" />
          <div class="p-3 flex justify-between items-center gap-3 text-xs">
            <span>{{ form.image ? 'New image preview' : 'Current image' }}</span>
            <button type="button" class="font-bold text-red-600 dark:text-red-400" @click="removeImage">Remove image</button>
          </div>
        </div>
        <p v-if="form.removeImage && !form.image" class="text-xs mt-3 text-[var(--text-secondary)]">The current image will be removed when you save. <button type="button" class="underline font-bold" @click="form.removeImage = false">Keep image</button></p>
      </div>
      <div>
        <label for="notice-pdf" class="field-label">PDF attachment (optional)</label>
        <input id="notice-pdf" ref="pdfInput" type="file" accept="application/pdf,.pdf" @change="handlePdfChange" class="premium-input text-sm" />
        <p class="text-xs text-[var(--text-secondary)] mt-2">Attach one PDF document up to {{ attachmentMaxMB }} MB. You can include both a poster image and a PDF.</p>
        <p v-if="pdfError" role="alert" class="text-sm text-red-500 mt-2">{{ pdfError }} <button type="button" class="underline" @click="clearPdfSelection">Clear PDF selection</button></p>
        <div v-if="form.pdf" class="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <p class="font-semibold text-sm break-all">{{ form.pdf.name }}</p>
          <p class="text-xs text-[var(--text-secondary)] mt-1">New PDF · {{ (form.pdf.size / 1024).toFixed(1) }} KB</p>
          <div class="flex flex-wrap items-center gap-4 mt-3 text-sm font-bold">
            <button type="button" class="underline" @click="pdfViewerSrc = pdfObjectUrl">Preview PDF</button>
            <button type="button" class="text-red-600 dark:text-red-400" @click="removePdf">Remove PDF</button>
          </div>
        </div>
        <div v-else-if="initialNotice?.pdfUrl && !form.removePdf" class="mt-3">
          <NoticePdfAttachment :notice="initialNotice" />
          <button type="button" class="text-sm font-bold text-red-600 dark:text-red-400 mt-2" @click="removePdf">Remove PDF</button>
        </div>
        <p v-if="form.removePdf && !form.pdf" class="text-xs mt-3 text-[var(--text-secondary)]">The current PDF will be removed when you save. <button type="button" class="underline font-bold" @click="form.removePdf = false">Keep PDF</button></p>
        <PdfViewer :src="pdfViewerSrc" :filename="form.pdf?.name || 'announcement.pdf'" @close="pdfViewerSrc = null" />
      </div>
      <p v-if="localError" role="alert" class="text-sm text-red-500">{{ localError }}</p>
      <div class="flex flex-wrap gap-3">
        <button type="submit" :disabled="submitting || Boolean(imageError) || Boolean(pdfError)" class="premium-btn-primary">{{ submitting ? 'Saving...' : initialNotice ? 'Save Changes' : 'Post Announcement' }}</button>
        <button v-if="initialNotice" type="button" class="premium-btn-secondary" @click="$emit('cancel')">Cancel</button>
      </div>
    </fieldset>
  </form>
</template>
<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { resolveImageUrl } from '../services/imageUrl';
import NoticePdfAttachment from './NoticePdfAttachment.vue';
import PdfViewer from './PdfViewer.vue';
const props = defineProps({ initialNotice: { type: Object, default: null }, submitting: { type: Boolean, default: false } });
const emit = defineEmits(['submit', 'cancel']);
const attachmentMaxMB = Number(import.meta.env.VITE_ATTACHMENT_MAX_MB) || 5;
const categories = ['General', 'Exam Schedules', 'Sports', 'Events', 'Academic'];
const batches = ['All', '2021', '2022', '2023', '2024', '2025', '2026'];
const blankForm = () => ({ title: '', body: '', category: 'General', targetBatch: 'All', image: null, removeImage: false, pdf: null, removePdf: false, eventDate: '', eventLocation: '' });
const form = reactive(blankForm());
const fileInput = ref(null);
const previewObjectUrl = ref('');
const imageError = ref('');
const pdfInput = ref(null), pdfError = ref(''), pdfObjectUrl = ref(''), pdfViewerSrc = ref(null);
const localError = ref('');
const releasePreview = () => { if (previewObjectUrl.value) URL.revokeObjectURL(previewObjectUrl.value); previewObjectUrl.value = ''; };
const releasePdfPreview = () => { pdfViewerSrc.value = null; if (pdfObjectUrl.value) URL.revokeObjectURL(pdfObjectUrl.value); pdfObjectUrl.value = ''; };
onBeforeUnmount(() => { releasePreview(); releasePdfPreview(); });
const previewUrl = computed(() => form.image ? previewObjectUrl.value : !form.removeImage ? resolveImageUrl(props.initialNotice?.imageUrl) : '');
const toLocalDateTime = value => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
watch(() => props.initialNotice, notice => {
  releasePreview(); releasePdfPreview(); imageError.value = ''; pdfError.value = ''; localError.value = '';
  if (fileInput.value) fileInput.value.value = '';
  if (pdfInput.value) pdfInput.value.value = '';
  Object.assign(form, blankForm(), notice ? { title: notice.title, body: notice.body, category: notice.category, targetBatch: notice.targetBatch || 'All', eventDate: toLocalDateTime(notice.eventDate), eventLocation: notice.eventLocation || '' } : {});
}, { immediate: true });
const clearSelection = () => {
  releasePreview(); form.image = null; imageError.value = '';
  if (fileInput.value) fileInput.value.value = '';
};
const handleFileChange = event => {
  const file = event.target.files?.[0];
  releasePreview(); form.image = null; imageError.value = '';
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) { imageError.value = 'Choose a JPEG, PNG, WebP or GIF image.'; return; }
  if (file.size > attachmentMaxMB * 1024 * 1024) { imageError.value = `Image size must not exceed ${attachmentMaxMB} MB.`; return; }
  form.image = file; form.removeImage = false; previewObjectUrl.value = URL.createObjectURL(file);
};
const removeImage = () => { clearSelection(); form.removeImage = Boolean(props.initialNotice?.imageUrl); };
const clearPdfSelection = () => {
  releasePdfPreview(); form.pdf = null; pdfError.value = '';
  if (pdfInput.value) pdfInput.value.value = '';
};
const handlePdfChange = event => {
  const file = event.target.files?.[0];
  releasePdfPreview(); form.pdf = null; pdfError.value = '';
  if (!file) return;
  if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf')) { pdfError.value = 'Choose a PDF document (.pdf).'; return; }
  if (file.size === 0) { pdfError.value = 'The PDF file is empty. Choose another document.'; return; }
  if (file.size > attachmentMaxMB * 1024 * 1024) { pdfError.value = `PDF size must not exceed ${attachmentMaxMB} MB.`; return; }
  form.pdf = file; form.removePdf = false; pdfObjectUrl.value = URL.createObjectURL(file);
};
const removePdf = () => { clearPdfSelection(); form.removePdf = Boolean(props.initialNotice?.pdfUrl); };
const handleSubmit = () => {
  localError.value = '';
  if (!form.title.trim() || !form.body.trim()) { localError.value = 'Enter a title and announcement content.'; return; }
  if (!props.submitting && !imageError.value && !pdfError.value) emit('submit', { ...form });
};
</script>
<style scoped>
.field-label { @apply block text-xs font-bold uppercase tracking-wider mb-2; color: var(--text-secondary); }
</style>
