import { create } from 'zustand';

// Dark mode is now the only theme - hardcoded
type Theme = 'dark';

interface ThemeStore {
  theme: Theme;
}

// Apply dark theme class to HTML element on load
const applyDarkTheme = () => {
  document.documentElement.classList.add('dark');
};

// Initialize dark theme immediately
applyDarkTheme();

export const useThemeStore = create<ThemeStore>(() => ({
  theme: 'dark',
}));
