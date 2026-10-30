<template>
  <Teleport to="body">
    <dialog ref="dialog" :aria-label="caption" @cancel.prevent="$emit('close')" class="image-dialog text-white bg-black/95">
      <div class="flex flex-wrap gap-3 items-center justify-between p-3 sm:p-4 border-b border-white/15">
        <p class="text-sm font-semibold truncate min-w-0 max-w-[70vw] sm:max-w-sm">{{ caption }}</p>
        <div class="flex items-center gap-2">
          <button type="button" title="Zoom out" aria-label="Zoom out" :disabled="scale <= 1" @click="zoom(-0.25)" class="tool">−</button>
          <span class="text-xs w-10 text-center" aria-live="polite">{{ Math.round(scale * 100) }}%</span>
          <button type="button" title="Zoom in" aria-label="Zoom in" :disabled="scale >= 4" @click="zoom(0.25)" class="tool">+</button>
          <button type="button" @click="reset" class="tool px-3">Reset</button>
          <a :href="src" :download="caption" target="_blank" rel="noopener noreferrer" class="tool px-3" aria-label="Download image">Save</a>
          <button type="button" autofocus aria-label="Close image" title="Close (Esc)" @click="$emit('close')" class="tool px-3">Close</button>
        </div>
      </div>
      <div class="image-stage flex items-center justify-center overflow-hidden" @click.self="scale === 1 && $emit('close')" @wheel.prevent="zoom($event.deltaY > 0 ? -0.25 : 0.25)" @pointerdown="startDrag" @pointermove="drag" @pointerup="stopDrag" @pointercancel="stopDrag" :style="{ touchAction: scale > 1 ? 'none' : 'manipulation', cursor: scale > 1 ? 'grab' : 'default' }">
        <img v-if="src" :src="src" :alt="caption" class="max-w-[94%] max-h-[90%] object-contain select-none" :style="{ transform: `translate(${x}px, ${y}px) scale(${scale})` }" @dragstart.prevent @click.stop />
      </div>
      <p class="text-center text-xs text-white/70 p-3">Use + / − to zoom. Drag when zoomed. Press Escape or Close to return.</p>
    </dialog>
  </Teleport>
</template>
<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
const props = defineProps({ src: { type: String, default: null }, caption: { type: String, default: 'Notice image' } });
defineEmits(['close']);
const dialog = ref(null), scale = ref(1), x = ref(0), y = ref(0);
let dragOrigin = null, previousOverflow = '';
const reset = () => { scale.value = 1; x.value = 0; y.value = 0; dragOrigin = null; };
const zoom = delta => { scale.value = Math.min(4, Math.max(1, scale.value + delta)); if (scale.value === 1) reset(); };
const startDrag = event => { if (scale.value > 1) { dragOrigin = { x: event.clientX - x.value, y: event.clientY - y.value }; event.currentTarget.setPointerCapture(event.pointerId); } };
const drag = event => { if (dragOrigin) { x.value = event.clientX - dragOrigin.x; y.value = event.clientY - dragOrigin.y; } };
const stopDrag = () => { dragOrigin = null; };
watch(() => props.src, async value => {
  reset(); await nextTick();
  if (value && dialog.value && !dialog.value.open) { previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; dialog.value.showModal(); }
  else if (!value && dialog.value?.open) { dialog.value.close(); document.body.style.overflow = previousOverflow; }
}, { immediate: true });
onBeforeUnmount(() => { if (dialog.value?.open) { dialog.value.close(); document.body.style.overflow = previousOverflow; } });
</script>
<style scoped>
.image-dialog { padding: 0; margin: 0; border: 0; width: 100vw; height: 100dvh; max-width: none; max-height: none; }
.image-dialog[open] { display: flex; flex-direction: column; }
.image-dialog::backdrop { background: rgb(0 0 0 / .85); }
.image-stage { flex: 1; min-height: 0; }
.tool { display: inline-flex; align-items: center; justify-content: center; min-width: 2rem; height: 2.25rem; border-radius: .5rem; background: rgb(255 255 255 / .12); color: white; font-size: .8rem; font-weight: 600; }
.tool:hover { background: rgb(255 255 255 / .24); }
.tool:disabled { opacity: .4; }
.tool:focus-visible { outline: 2px solid #ffd60a; outline-offset: 2px; }
</style>
