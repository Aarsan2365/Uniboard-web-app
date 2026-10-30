<template>
  <section aria-label="PDF attachment" class="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <span class="shrink-0 rounded-lg bg-red-100 text-red-800 px-2 py-3 text-xs font-bold">PDF</span>
        <div class="min-w-0">
          <p class="font-semibold text-sm break-all">{{ notice.pdfName || 'announcement.pdf' }}</p>
          <p class="text-xs text-[var(--text-secondary)] mt-1">Document attachment</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button type="button" :disabled="loading" @click="viewPdf" class="premium-btn-secondary text-sm">{{ loading ? 'Loading PDF...' : 'View PDF' }}</button>
        <button type="button" :disabled="loading" @click="downloadPdf" class="premium-btn-secondary text-sm">Download PDF</button>
      </div>
    </div>
    <p v-if="error" role="alert" class="text-sm text-red-600 dark:text-red-400 mt-3">{{ error }}</p>
    <PdfViewer :src="viewerSrc" :filename="notice.pdfName || 'announcement.pdf'" @close="viewerSrc = null" />
  </section>
</template>
<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import noticeService from '../services/noticeService';
import PdfViewer from './PdfViewer.vue';
const props = defineProps({ notice: { type: Object, required: true } });
const loading = ref(false), error = ref(''), viewerSrc = ref(null);
let blobUrl = '', requestNumber = 0, controller;
const reset = () => {
  requestNumber++;
  controller?.abort();
  viewerSrc.value = null;
  if (blobUrl) URL.revokeObjectURL(blobUrl);
  blobUrl = '';
  error.value = '';
  loading.value = false;
};
watch(() => [props.notice.id, props.notice.pdfUrl], reset);
onBeforeUnmount(reset);
const loadPdf = async download => {
  if (blobUrl) return blobUrl;
  const request = ++requestNumber;
  controller = new AbortController();
  loading.value = true;
  error.value = '';
  try {
    const blob = await noticeService.getPdf(props.notice.id, { download, signal: controller.signal });
    if (request !== requestNumber) return null;
    blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  } catch (err) {
    if (request === requestNumber) error.value = err.response?.data?.message || err.message || 'Unable to load this PDF. Try again.';
    return null;
  } finally { if (request === requestNumber) loading.value = false; }
};
const viewPdf = async () => { if (!loading.value) viewerSrc.value = await loadPdf(false); };
const downloadPdf = async () => {
  if (loading.value) return;
  const url = await loadPdf(true);
  if (!url) return;
  const link = document.createElement('a');
  link.href = url;
  link.download = props.notice.pdfName || 'announcement.pdf';
  document.body.append(link);
  link.click();
  link.remove();
};
</script>
