import { Event } from '@tauri-apps/api/event';
import { RootConfig, Theme } from '../../types';

export function listenForThemePreviewUpdate(event: Event<Theme>) {
  const previewTheme = event.payload;
  if (previewTheme) {
    Object.entries(previewTheme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }
}

export function listenForThemePreviewRevert(state: RootConfig) {
  const theme = state.app.themes.find((t) => t.id === state.app.currentThemeId);
  if (theme) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }
}
