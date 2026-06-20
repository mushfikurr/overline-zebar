import { Event } from '@tauri-apps/api/event';
import { RootConfig, Theme } from '../../types';
import { withDerivedThemeColors } from '../../utils/theme-colors';

export function listenForThemePreviewUpdate(event: Event<Theme>) {
  const previewTheme = event.payload;
  if (previewTheme) {
    const colors = withDerivedThemeColors(previewTheme.colors);
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }
}

export function listenForThemePreviewRevert(state: RootConfig) {
  const theme = state.app.themes.find((t) => t.id === state.app.currentThemeId);
  if (theme) {
    const colors = withDerivedThemeColors(theme.colors);
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }
}
