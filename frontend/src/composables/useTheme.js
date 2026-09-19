// composables/useTheme.js
//
// Manages the light/dark theme preference. Reads from localStorage on
// first load (or falls back to system preference), persists changes
// back to localStorage, and synchronises by toggling the 'dark' class
// on the <html> element — which Tailwind's darkMode: 'class' picks up.

import { ref, watch, onMounted } from 'vue';

const isDark = ref(false);

const applyTheme = (dark) => {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const initTheme = () => {
  const stored = localStorage.getItem('uniboard_theme');
  if (stored) {
    isDark.value = stored === 'dark';
  } else {
    // Fall back to system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  applyTheme(isDark.value);
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
};

// Persist and apply whenever isDark changes
watch(isDark, (val) => {
  localStorage.setItem('uniboard_theme', val ? 'dark' : 'light');
  applyTheme(val);
});

export function useTheme() {
  onMounted(initTheme);
  return { isDark, toggleTheme };
}
