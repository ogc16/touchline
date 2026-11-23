import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform, useColorScheme } from 'react-native';

import {
  darkColors,
  getElevation,
  lightColors,
  type ThemeColors,
} from './tokens';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ColorMode = 'light' | 'dark';

const STORAGE_KEY = 'touchline.theme';

interface ThemeContextValue {
  colors: ThemeColors;
  elevation: ReturnType<typeof getElevation>;
  mode: ColorMode;
  preference: ThemePreference;
  isDark: boolean;
  setPreference: (value: ThemePreference) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readPreference(): ThemePreference {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return 'system';
  }
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }
  } catch {
    return 'system';
  }
  return 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>(readPreference);
  const mode: ColorMode =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  const isDark = mode === 'dark';

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      return;
    }
  }, [preference]);

  const toggleMode = useCallback(() => {
    setPreference((current) => {
      if (current === 'system') {
        return systemScheme === 'dark' ? 'light' : 'dark';
      }
      return current === 'dark' ? 'light' : 'dark';
    });
  }, [systemScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? darkColors : lightColors,
      elevation: getElevation(isDark),
      mode,
      preference,
      isDark,
      setPreference,
      toggleMode,
    }),
    [isDark, mode, preference, toggleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}
