import { create } from 'zustand';
import { CustomProvider } from 'rsuite';

type Theme = Parameters<typeof CustomProvider>[0]['theme'];

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));