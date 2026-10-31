import { useEffect } from 'react';
import { Effect } from '@tauri-apps/api/window';
import * as zebar from 'zebar';
import { RootConfig } from '../types';
import { parseHexColor } from '../utils/parseHexColor';

const effectMap: Record<string, Effect[]> = {
  acrylic: [Effect.Acrylic],
  blur: [Effect.Blur],
  mica: [Effect.Mica],
  none: [],
};

// Unknown effect names resolve to no effect - window effects are
// experimental and must never be force-applied implicitly.
const DEFAULT_EFFECT: Effect[] = [];
const DEFAULT_COLOR = '#1e2228e0';

function resolveEffects(name: string): Effect[] {
  return effectMap[name] ?? DEFAULT_EFFECT;
}

function resolveBackgroundColor(config: RootConfig): string {
  const theme = config.app.themes.find(
    (t) => t.id === config.app.currentThemeId
  );
  return theme?.colors['--background'] ?? DEFAULT_COLOR;
}

export function useWindowEffects(state: RootConfig) {
  useEffect(() => {
    const effects = resolveEffects(state.app.windowEffect);
    const color = parseHexColor(resolveBackgroundColor(state));
    const tauriWindow = zebar.currentWidget().tauriWindow;

    // Clear any previously applied backdrop before applying a new one:
    // - `setEffects` with an empty list does NOT clear an existing
    //   backdrop, so `clearEffects` is required for the 'none' case.
    // - Applying one effect does not unset another (acrylic, blur and
    //   mica use different mechanisms on Windows), so switching between
    //   effects would otherwise leave stale backdrops behind.
    tauriWindow
      .clearEffects()
      .catch(() => {})
      .then(() =>
        effects.length > 0
          ? tauriWindow.setEffects({ effects, color }).catch(() => {})
          : undefined
      );
  }, [state.app.windowEffect, state.app.currentThemeId, state.app.themes]);
}
