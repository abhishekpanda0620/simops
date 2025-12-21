import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Apply theme class to HTML element
// Dark mode uses 'dark' class, light mode has no class
const applyTheme = (theme: Theme) => {
  const html = document.documentElement;
  if (theme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
};

// Get initial theme from localStorage or default to 'dark'
const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem('simops_theme');
  if (stored === 'light' || stored === 'dark') {
    applyTheme(stored);
    return stored;
  }
  // Default to dark
  applyTheme('dark');
  return 'dark';
};

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: getInitialTheme(),

  setTheme: (theme) => {
    localStorage.setItem('simops_theme', theme);
    applyTheme(theme);
    set({ theme });
  },
}));
