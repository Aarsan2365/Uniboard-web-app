<!--
  components/CategoryFilter.vue

  Emits a `change` event with the selected category ("" means "All").
  Kept dumb on purpose — it doesn't know about the API at all, it
  just tells its parent what the user picked.
-->
<template>
  <div class="flex flex-wrap gap-1.5">
    <button
      v-for="option in options"
      :key="option"
      @click="select(option)"
      :class="[
        'px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-250 active:scale-95 cursor-pointer',
        modelValue === option
          ? 'bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-500/10'
          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-200',
      ]"
    >
      {{ option === '' ? 'All Categories' : option }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue']);

const options = ['', 'Exam Schedules', 'Sports', 'General', 'Events', 'Academic'];

const select = (option) => emit('update:modelValue', option);
</script>
