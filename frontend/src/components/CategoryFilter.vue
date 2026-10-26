<template>
  <div class="flex flex-wrap gap-1.5">
    <button
      v-for="option in options"
      :key="option"
      type="button"
      @click="select(option)"
      :class="[
        'px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 active:scale-95 cursor-pointer',
        modelValue === option
          ? 'bg-[#FFD60A] text-[#0A0A0A] border-[#FFD60A] shadow-sm'
          : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[#FFD60A] hover:text-[#8A7200] dark:hover:text-[#FFD60A]'
      ]"
    >
      {{ option === '' ? 'All Categories' : option }}
    </button>
  </div>
</template>

<script setup>
defineProps({ modelValue: { type: String, default: '' } });
const emit = defineEmits(['update:modelValue']);
const options = ['', 'Exam Schedules', 'Sports', 'General', 'Events', 'Academic'];
const select = (option) => emit('update:modelValue', option);
</script>
