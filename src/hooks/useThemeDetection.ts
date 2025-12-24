// ============================================
// SYSTEM THEME DETECTION HOOK
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Platform, Appearance, ColorSchemeName } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface UseThemeDetectionOptions {
  defaultTheme?: ThemeMode;
  onChange?: (theme: 'light' | 'dark') => void;
}

interface UseThemeDetectionReturn {
  theme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  isLight: boolean;
}

/**
 * Hook to detect and manage system theme preferences
 */
export const useThemeDetection = (
  options: UseThemeDetectionOptions = {}
): UseThemeDetectionReturn => {
  const { defaultTheme = 'system', onChange } = options;

  // Get initial system theme
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'dark'; // Default for web
    }
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  }, []);

  const [themeMode, setThemeMode] = useState<ThemeMode>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);

  // Calculate effective theme
  const theme = themeMode === 'system' ? systemTheme : themeMode;

  // Listen for system theme changes
  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || !window.matchMedia) return;

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light';
        setSystemTheme(newTheme);
        if (themeMode === 'system') {
          onChange?.(newTheme);
        }
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
      // Legacy browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    } else {
      // React Native
      const subscription = Appearance.addChangeListener(({ colorScheme }: { colorScheme: ColorSchemeName }) => {
        const newTheme = colorScheme === 'dark' ? 'dark' : 'light';
        setSystemTheme(newTheme);
        if (themeMode === 'system') {
          onChange?.(newTheme);
        }
      });

      return () => subscription.remove();
    }
  }, [themeMode, onChange, getSystemTheme]);

  // Notify on theme change
  useEffect(() => {
    onChange?.(theme);
  }, [theme, onChange]);

  return {
    theme,
    systemTheme,
    themeMode,
    setThemeMode,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
};

/**
 * Hook to get theme-aware colors
 */
export const useThemeColors = <T extends Record<string, { light: string; dark: string }>>(
  colorMap: T
): Record<keyof T, string> => {
  const { theme } = useThemeDetection();

  return Object.entries(colorMap).reduce((acc, [key, value]) => {
    acc[key as keyof T] = value[theme];
    return acc;
  }, {} as Record<keyof T, string>);
};

/**
 * Common theme-aware color definitions
 */
export const commonThemeColors = {
  background: { light: '#FFFFFF', dark: '#0D0D0D' },
  surface: { light: '#F5F5F5', dark: '#1A1A1A' },
  surfaceLight: { light: '#EEEEEE', dark: '#252525' },
  textPrimary: { light: '#1A1A1A', dark: '#FFFFFF' },
  textSecondary: { light: '#666666', dark: '#A3A3A3' },
  textMuted: { light: '#999999', dark: '#737373' },
  border: { light: '#E0E0E0', dark: '#333333' },
};

export default useThemeDetection;
