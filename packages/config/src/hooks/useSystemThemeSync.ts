import { useCallback, useEffect, useRef } from 'react';
import { useConfigState } from './useConfigContext';
import { useThemes } from './useThemes';

const darkSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

/**
 * Applies the Zebar theme mapped to the preferred system theme (light/dark),
 * following both OS transitions and reassignments of the light/dark slots,
 * so picking a theme for the current Windows appearance applies it
 * immediately.
 *
 * Mount this in a single always-running widget (the main topbar) so that
 * multiple widgets don't race writing the config.
 */
export function useSystemThemeSync() {
  const { app } = useConfigState();
  const { themes, setActiveTheme } = useThemes();

  const stateRef = useRef(app);
  stateRef.current = app;

  const themesRef = useRef(themes);
  themesRef.current = themes;

  const applyThemeForSystemPreference = useCallback(() => {
    const { currentThemeId, systemThemeSync, lightThemeId, darkThemeId } =
      stateRef.current;

    if (!systemThemeSync) {
      return;
    }

    const targetThemeId = darkSchemeQuery.matches ? darkThemeId : lightThemeId;
    if (!targetThemeId || currentThemeId === targetThemeId) {
      return;
    }

    if (!themesRef.current.some((theme) => theme.id === targetThemeId)) {
      return;
    }

    setActiveTheme(targetThemeId);
  }, [setActiveTheme]);

  // Snap to the mapped theme for the current system preference whenever
  // syncing is enabled or the slot assignments change, including on widget
  // startup. Slots for the non-current appearance only apply on the next
  // OS transition.
  useEffect(() => {
    if (app.systemThemeSync) {
      applyThemeForSystemPreference();
    }
  }, [
    app.systemThemeSync,
    app.lightThemeId,
    app.darkThemeId,
    applyThemeForSystemPreference,
  ]);

  // Track system theme transitions.
  useEffect(() => {
    darkSchemeQuery.addEventListener('change', applyThemeForSystemPreference);
    return () =>
      darkSchemeQuery.removeEventListener(
        'change',
        applyThemeForSystemPreference
      );
  }, [applyThemeForSystemPreference]);
}
