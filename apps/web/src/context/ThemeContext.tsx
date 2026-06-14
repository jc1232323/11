import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type Locale, setI18nLocale } from '../lib/i18n';

export type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  locale: Locale;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  setLocale: (l: Locale) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  locale: 'zh',
  toggleTheme: () => {},
  setTheme: () => {},
  setLocale: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

function getInitialLocale(): Locale {
  const stored = localStorage.getItem('locale');
  if (stored === 'zh' || stored === 'en') return stored;
  return 'zh';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply locale
  useEffect(() => {
    setI18nLocale(locale);
    localStorage.setItem('locale', locale);
    document.documentElement.setAttribute('lang', locale === 'zh' ? 'zh-CN' : 'en');
  }, [locale]);

  const toggleTheme = () => setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  const setTheme = (t: Theme) => setThemeState(t);
  const setLocale = (l: Locale) => {
    setLocaleState(l);
    setI18nLocale(l);
  };

  return (
    <ThemeContext.Provider value={{ theme, locale, toggleTheme, setTheme, setLocale }}>
      {children}
    </ThemeContext.Provider>
  );
}
