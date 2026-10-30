<template>
  <Teleport to="body">
    <dialog ref="dialog" :aria-label="filename" @cancel.prevent="$emit('close')" class="pdf-dialog bg-[var(--surface)] text-[var(--text-main)]">
      <div class="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[var(--border)]">
        <p class="font-bold text-sm min-w-0 break-words">{{ filename }}</p>
        <button type="button" autofocus aria-label="Close PDF" @click="$emit('close')" class="premium-btn-secondary">Close</button>
      </div>
      <div class="flex flex-wrap gap-3 items-center p-3 border-b border-[var(--border)] text-xs">
        <button type="button" aria-label="Previous PDF page" :disabled="loading || pageNumber <= 1" @click="pageNumber--" class="pdf-tool">Previous</button>
        <span aria-live="polite">Page {{ pageNumber }} of {{ pageCount || '…' }}</span>
        <button type="button" aria-label="Next PDF page" :disabled="loading || pageNumber >= pageCount" @click="pageNumber++" class="pdf-tool">Next</button>
        <button type="button" aria-label="Zoom PDF out" :disabled="loading || zoom <= 0.5" @click="zoom = Math.max(0.5, zoom - 0.25)" class="pdf-tool">−</button>
        <span>{{ Math.round(zoom * 100) }}%</span>
        <button type="button" aria-label="Zoom PDF in" :disabled="loading || zoom >= 3" @click="zoom = Math.min(3, zoom + 0.25)" class="pdf-tool">+</button>
      </div>
      <div class="flex flex-wrap gap-3 items-center px-3 py-2 border-b border-[var(--border)] text-xs">
        <a :href="src" target="_blank" rel="noopener noreferrer" class="font-bold underline">Open PDF in new tab</a>
        <a :href="src" :download="filename" class="font-bold underline">Download PDF</a>
      </div>
      <div ref="stage" class="pdf-stage flex-1 min-h-0 min-w-0 overflow-auto bg-neutral-700 p-3">
        <p v-if="loading" role="status" class="text-white text-sm text-center py-3">Loading PDF...</p>
        <p v-if="error" role="alert" class="text-white text-sm text-center p-4">{{ error }} You can still download the document or open it in a new tab.</p>
        <canvas v-show="!loading && !error" ref="canvas" :data-rendered-page="renderedPage" role="img" :aria-label="`PDF page ${pageNumber} of ${pageCount}: ${filename}`" class="block mx-auto bg-white shadow-lg"></canvas>
        <p class="sr-only">{{ pageText }}</p>
      </div>
    </dialog>
  </Teleport>
</template>
<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
const props = defineProps({ src: { type: String, default: null }, filename: { type: String, default: 'announcement.pdf' } });
defineEmits(['close']);
const dialog = ref(null);
const stage = ref(null), canvas = ref(null), pageNumber = ref(1), pageCount = ref(0), zoom = ref(1);
const loading = ref(false), error = ref(''), pageText = ref(''), renderedPage = ref(0);
let previousOverflow = '';
let documentTask = null, pdfDocument = null, renderTask = null, documentNumber = 0, renderNumber = 0;
let resizeObserver, resizeTimer;
const releaseDocument = async () => {
  renderNumber++;
  renderTask?.cancel();
  const task = documentTask;
  documentTask = null; pdfDocument = null;
  if (task) await task.destroy().catch(() => {});
};
const renderPage = async () => {
  const pdf = pdfDocument;
  if (!pdf || !canvas.value || !stage.value || !dialog.value?.open) return;
  const request = ++renderNumber, currentPage = pageNumber.value;
  loading.value = true; error.value = ''; renderedPage.value = 0;
  try {
    if (renderTask) { renderTask.cancel(); await renderTask.promise.catch(() => {}); }
    if (request !== renderNumber || pdf !== pdfDocument) return;
    const page = await pdf.getPage(currentPage);
    if (request !== renderNumber || pdf !== pdfDocument) return;
    const base = page.getViewport({ scale: 1 });
    const fit = Math.max(200, stage.value.clientWidth - 32) / base.width;
    const scale = Math.min(fit * zoom.value, 4096 / base.width, 4096 / base.height);
    const viewport = page.getViewport({ scale });
    const outputScale = Math.min(window.devicePixelRatio || 1, 2);
    const target = canvas.value;
    target.width = Math.ceil(viewport.width * outputScale);
    target.height = Math.ceil(viewport.height * outputScale);
    target.style.width = `${Math.ceil(viewport.width)}px`;
    target.style.height = `${Math.ceil(viewport.height)}px`;
    renderTask = page.render({ canvasContext: target.getContext('2d'), viewport, transform: [outputScale, 0, 0, outputScale, 0, 0] });
    await renderTask.promise;
    if (request !== renderNumber) return;
    renderedPage.value = currentPage;
    loading.value = false;
    const text = await page.getTextContent();
    if (request === renderNumber) pageText.value = text.items.map(item => item.str || '').join(' ');
  } catch (err) {
    if (request === renderNumber && err.name !== 'RenderingCancelledException') {
      loading.value = false;
      error.value = 'This PDF page could not be displayed.';
    }
  }
};
watch([pageNumber, zoom], renderPage);
watch(() => props.src, async value => {
  const request = ++documentNumber;
  clearTimeout(resizeTimer); resizeObserver?.disconnect();
  const release = releaseDocument();
  loading.value = Boolean(value); error.value = ''; pageCount.value = 0; pageNumber.value = 1; zoom.value = 1; pageText.value = '';
  if (!value && dialog.value?.open) { dialog.value.close(); document.body.style.overflow = previousOverflow; }
  await release;
  await nextTick();
  if (request !== documentNumber || !value) return;
  if (value && dialog.value && !dialog.value.open) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.value.showModal();
  }
  try {
    const pdfjs = await import('pdfjs-dist');
    if (request !== documentNumber) return;
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    const assetBase = new URL(`${import.meta.env.BASE_URL}pdfjs/`, window.location.href).href;
    const task = pdfjs.getDocument({ url: value, cMapUrl: `${assetBase}cmaps/`, cMapPacked: true, standardFontDataUrl: `${assetBase}standard_fonts/`, wasmUrl: `${assetBase}wasm/`, iccUrl: `${assetBase}iccs/`, isEvalSupported: false });
    documentTask = task;
    const pdf = await task.promise;
    if (request !== documentNumber) { await task.destroy(); return; }
    pdfDocument = pdf; pageCount.value = pdf.numPages;
    await renderPage();
    if (request !== documentNumber) return;
    let lastWidth = stage.value.clientWidth;
    resizeObserver = new ResizeObserver(entries => {
      const width = Math.round(entries[0].contentRect.width);
      if (width === lastWidth) return;
      lastWidth = width;
      clearTimeout(resizeTimer); resizeTimer = setTimeout(renderPage, 100);
    });
    resizeObserver.observe(stage.value);
  } catch (err) {
    if (request !== documentNumber) return;
    loading.value = false;
    error.value = err.name === 'PasswordException' ? 'This PDF requires a password.' : 'This PDF could not be previewed.';
  }
}, { immediate: true });
onBeforeUnmount(() => {
  documentNumber++;
  clearTimeout(resizeTimer); resizeObserver?.disconnect();
  void releaseDocument();
  if (dialog.value?.open) {
    dialog.value.close();
    document.body.style.overflow = previousOverflow;
  }
});
</script>
<style scoped>
.pdf-dialog { padding: 0; width: min(70rem, 96vw); height: 92dvh; max-width: 96vw; max-height: 96dvh; border: 1px solid var(--border); border-radius: 1rem; }
.pdf-dialog[open] { display: flex; flex-direction: column; }
.pdf-dialog::backdrop { background: rgb(0 0 0 / .8); }
.pdf-tool { border: 1px solid var(--border); border-radius: .4rem; padding: .4rem .65rem; font-weight: 600; }
.pdf-tool:disabled { opacity: .45; cursor: default; }
.pdf-tool:focus-visible { outline: 2px solid #ffd60a; outline-offset: 2px; }
</style>
