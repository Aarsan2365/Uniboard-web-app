<template>
  <div class="relative overflow-hidden bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 hover:bg-[var(--surface-hover)] hover:border-[#FFD60A]/40 hover:-translate-y-1 transition-all duration-300 group">
    <div :class="['absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-10', glowClass]"></div>
    <div class="relative flex justify-between items-start">
      <div>
        <p class="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{{ title }}</p>
        <h2 class="text-3xl font-black text-[var(--text-main)] mt-3">{{ value }}</h2>
        <div class="flex items-center gap-1.5 mt-3">
          <AppIcon v-if="positive" name="trend-up" :size="14" class="text-emerald-500" />
          <span :class="['text-xs font-semibold', positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-secondary)]']">
            {{ description }}
          </span>
        </div>
      </div>
      <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300', iconClass]">
        <AppIcon :name="iconName" :size="22" />
      </div>
    </div>
  </div>
</template>

<script setup>
import AppIcon from './AppIcon.vue';

defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  description: { type: String, default: '' },
  iconName: { type: String, required: true },
  iconClass: { type: String, default: 'bg-[#FFD60A] text-[#0A0A0A]' },
  glowClass: { type: String, default: 'bg-[#FFD60A]' },
  positive: { type: Boolean, default: true },
});
</script>
