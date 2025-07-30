import { useMemo } from 'react';
import { Theme } from '../types';
import { useThemeProperties } from './useConfig';

// Simple debounce implementation
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => void;
}

export function useDebouncedThemeProperties(delay: number = 200): (theme: Theme) => void {
  const setThemeProperties = useThemeProperties();

  const debouncedSetThemeProperties = useMemo(
    () => debounce(setThemeProperties, delay),
    [setThemeProperties, delay]
  );

  return debouncedSetThemeProperties;
}
