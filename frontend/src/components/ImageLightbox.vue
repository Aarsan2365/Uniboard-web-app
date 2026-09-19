<!--
  components/ImageLightbox.vue

  A full-screen overlay that displays a single image at its natural size.
  Supports:
    • Click backdrop or press Escape to close
    • Zoom in/out with +/- buttons or scroll wheel
    • Drag/pan the image when zoomed in
    • Download button
    • Smooth open/close animation
-->
<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="src"
        class="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        @click.self="$emit('close')"
        @keydown.esc.window="$emit('close')"
        @wheel.prevent="onWheel"
      >
        <!-- Toolbar -->
        <div class="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none">
          <p class="text-white text-sm font-semibold opacity-70 pointer-events-none truncate max-w-xs">{{ caption }}</p>
          <div class="flex items-center gap-2 pointer-events-auto">
            <!-- Zoom out -->
            <button
              @click="zoomOut"
              class="h-8 w-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              title="Zoom out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>

            <!-- Zoom level label -->
            <span class="text-white text-xs font-bold w-12 text-center opacity-70">{{ Math.round(scale * 100) }}%</span>

            <!-- Zoom in -->
            <button
              @click="zoomIn"
              class="h-8 w-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              title="Zoom in"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>

            <!-- Reset zoom -->
            <button
              @click="resetZoom"
              class="h-8 px-3 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
              title="Reset zoom"
            >
              Reset
            </button>

            <span class="w-px h-5 bg-white/20"></span>

            <!-- Download -->
            <a
              :href="src"
              :download="caption || 'attachment'"
              target="_blank"
              class="h-8 w-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              title="Download image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>

            <!-- Close -->
            <button
              @click="$emit('close')"
              class="h-8 w-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-rose-500/80 text-white transition"
              title="Close (Esc)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Image container (draggable when zoomed) -->
        <div
          ref="containerRef"
          class="relative select-none overflow-hidden flex items-center justify-center w-full h-full"
          @mousedown="startDrag"
          @mousemove="onDrag"
          @mouseup="stopDrag"
          @mouseleave="stopDrag"
          :style="{ cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default' }"
        >
          <img
            :src="src"
            :alt="caption"
            class="max-w-none pointer-events-none select-none"
            :style="{
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              maxWidth: scale <= 1 ? '90vw' : 'none',
              maxHeight: scale <= 1 ? '88vh' : 'none',
            }"
            @dragstart.prevent
          />
        </div>

        <!-- Hint footer -->
        <div class="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
          <p class="text-white/40 text-xs">Scroll to zoom · Drag to pan · Click outside or Esc to close</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  src:     { type: String, default: null },
  caption: { type: String, default: 'Image' },
});

defineEmits(['close']);

/* ── Zoom state ── */
const scale      = ref(1);
const translateX = ref(0);
const translateY = ref(0);

const ZOOM_STEP = 0.25;
const MAX_ZOOM  = 4;
const MIN_ZOOM  = 0.5;

const clampedScale = (v) => Math.min(Math.max(v, MIN_ZOOM), MAX_ZOOM);

const zoomIn    = () => { scale.value = clampedScale(scale.value + ZOOM_STEP); };
const zoomOut   = () => { scale.value = clampedScale(scale.value - ZOOM_STEP); if (scale.value <= 1) resetTranslate(); };
const resetZoom = () => { scale.value = 1; resetTranslate(); };

const resetTranslate = () => { translateX.value = 0; translateY.value = 0; };

const onWheel = (e) => {
  const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
  scale.value = clampedScale(scale.value + delta);
  if (scale.value <= 1) resetTranslate();
};

/* ── Drag / pan state ── */
const isDragging = ref(false);
let   dragStartX = 0;
let   dragStartY = 0;
let   dragOriginX = 0;
let   dragOriginY = 0;

const startDrag = (e) => {
  if (scale.value <= 1) return;
  isDragging.value = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragOriginX = translateX.value;
  dragOriginY = translateY.value;
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  translateX.value = dragOriginX + (e.clientX - dragStartX);
  translateY.value = dragOriginY + (e.clientY - dragStartY);
};

const stopDrag = () => { isDragging.value = false; };

/* Reset transform when a new image is shown */
watch(() => props.src, () => { scale.value = 1; resetTranslate(); });
</script>

<style scoped>
/* Fade + slight scale-up entrance */
.lightbox-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.lightbox-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.lightbox-enter-from  { opacity: 0; }
.lightbox-leave-to    { opacity: 0; }
</style>
