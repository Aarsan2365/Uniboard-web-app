<!--
  components/NoticeForm.vue

  Used for both "create" and "edit" — if an `initialNotice` prop is
  passed, the form pre-fills and emits an update; otherwise it's a
  blank create form. Keeps AdminPanelView from needing two components.
-->
<template>
  <form @submit.prevent="handleSubmit" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 animate-slide-up">
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
      <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
        {{ initialNotice ? 'Edit Announcement' : 'Post New Announcement' }}
      </h3>
      <span class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Admin Only</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Title</label>
        <input
          v-model="form.title"
          type="text"
          required
          class="premium-input"
          placeholder="e.g. Final Exam Timetable Released"
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Announcement Category</label>
        <select
          v-model="form.category"
          class="premium-select"
        >
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
    </div>

    <!-- Target batch row -->
    <div>
      <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
        Target Batch
      </label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="b in batchOptions"
          :key="b.value"
          type="button"
          @click="form.targetBatch = b.value"
          :class="[
            'px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 active:scale-95',
            form.targetBatch === b.value
              ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
          ]"
        >
          {{ b.label }}
        </button>
      </div>
      <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 pl-0.5">
        'All Batches' broadcasts to every student. Pick a year to target only that cohort.
      </p>
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Body Content</label>
      <textarea
        v-model="form.body"
        required
        rows="4"
        class="premium-input resize-none"
        placeholder="Type full announcement text here..."
      ></textarea>
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
        Image Attachment (optional)
      </label>
      <div class="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-dashed rounded-lg">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          @change="handleFileChange"
          class="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-md file:border-0 file:bg-brand-50 file:text-brand-700 file:text-xs file:font-semibold hover:file:bg-brand-100 cursor-pointer"
        />
      </div>
      <p v-if="initialNotice?.imageUrl && !form.image" class="text-xs text-slate-400 dark:text-slate-500 mt-1.5 pl-1">
        Leave blank to preserve the existing image attachment.
      </p>
    </div>

    <div class="flex gap-3 pt-2">
      <button
        type="submit"
        class="premium-btn-primary"
      >
        {{ initialNotice ? 'Save Changes' : 'Post Announcement' }}
      </button>
      <button
        v-if="initialNotice"
        type="button"
        @click="$emit('cancel')"
        class="premium-btn-secondary"
      >
        Cancel
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  initialNotice: { type: Object, default: null },
});
const emit = defineEmits(['submit', 'cancel']);

const categories = ['General', 'Exam Schedules', 'Sports', 'Events', 'Academic'];
const batchOptions = [
  { value: 'All',  label: 'All Batches' },
  { value: '2021', label: 'Batch 2021' },
  { value: '2022', label: 'Batch 2022' },
  { value: '2023', label: 'Batch 2023' },
  { value: '2024', label: 'Batch 2024' },
  { value: '2025', label: 'Batch 2025' },
];

const blankForm = () => ({ title: '', body: '', category: 'General', targetBatch: 'All', image: null });

const form = reactive(blankForm());

// If the parent swaps in a notice to edit (or clears it back to null),
// keep the form in sync. `image` always resets to null — editing
// doesn't re-fetch the existing file, only lets you replace it.
watch(
  () => props.initialNotice,
  (notice) => {
    Object.assign(
      form,
      notice
        ? { title: notice.title, body: notice.body, category: notice.category, targetBatch: notice.targetBatch || 'All', image: null }
        : blankForm()
    );
  },
  { immediate: true }
);

const handleFileChange = (event) => {
  form.image = event.target.files[0] || null;
};

const handleSubmit = () => {
  emit('submit', { ...form });
  if (!props.initialNotice) Object.assign(form, blankForm());
};
</script>
