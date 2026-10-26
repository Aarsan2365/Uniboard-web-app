import { ref } from 'vue';

const savedTheme = localStorage.getItem('uniboard-theme') || localStorage.getItem('uniboard_theme');
const isDark = ref(savedTheme ? savedTheme === 'dark' : false);

const applyTheme = () => {
  document.documentElement.classList.toggle('dark', isDark.value);
};

applyTheme();

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value;
    applyTheme();
    localStorage.setItem('uniboard-theme', isDark.value ? 'dark' : 'light');
    localStorage.removeItem('uniboard_theme');
  };

  return { isDark, toggleTheme };
}
