import { useCallback, useEffect, useState } from 'react';
import type { FontData, FontQueryWindow } from './useLocalFontAccess';
import type { FontPermission } from './useFontPermission';

const BUILTIN_FONTS = ['Geist Mono'];

interface UseLocalFontsOptions {
  open: boolean;
  permission: FontPermission;
  supported: boolean;
}

interface UseLocalFontsResult {
  fonts: string[] | null;
  loading: boolean;
  loadError: boolean;
  loadFonts: () => void;
  reset: () => void;
}

/**
 * Enumerates installed font families via the Local Font Access API.
 * Auto-loads when permission is already granted (or the Permissions
 * API is unavailable). `loadFonts` doubles as the "Grant access" trigger;
 * `reset` powers the "Try again" re-entry path.
 */
export function useLocalFonts({
  open,
  permission,
  supported,
}: UseLocalFontsOptions): UseLocalFontsResult {
  const [fonts, setFonts] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const loadFonts = useCallback(() => {
    if (!supported || fonts !== null || loading) return;
    setLoading(true);
    setLoadError(false);
    (window as FontQueryWindow).queryLocalFonts!()
      .then((data: FontData[]) => {
        const families = Array.from(new Set(data.map((d) => d.family))).sort(
          (a, b) => a.localeCompare(b)
        );
        const merged = [
          ...BUILTIN_FONTS,
          ...families.filter((f) => !BUILTIN_FONTS.includes(f)),
        ];
        setFonts(merged);
      })
      .catch(() => {
        setLoadError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [supported, fonts, loading]);

  // Auto-load when permission is already granted, or if the Permissions API
  // is unavailable (fall back to the original always-load behaviour).
  useEffect(() => {
    if (
      open &&
      fonts === null &&
      !loading &&
      !loadError &&
      (permission === 'granted' || permission === 'unsupported')
    ) {
      loadFonts();
    }
  }, [open, permission, fonts, loading, loadError, loadFonts]);

  const reset = useCallback(() => {
    setFonts(null);
    setLoadError(false);
  }, []);

  return { fonts, loading, loadError, loadFonts, reset };
}
