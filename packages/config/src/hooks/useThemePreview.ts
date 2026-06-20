import { useState, useCallback } from 'react';
import { Theme } from '../types';
import { useThemes } from './useThemes';
import { withDerivedThemeColors } from '../utils/theme-colors';
import * as zebar from 'zebar';

export function useThemePreview() {
  const { addTheme, setActiveTheme, activeTheme } = useThemes();
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);

  const isPreviewing = !!previewTheme;

  const applyPreviewStyles = useCallback((theme: Theme) => {
    // Apply locally for instant feedback
    const colors = withDerivedThemeColors(theme.colors);
    Object.entries(colors).forEach(([key, value]) => {
      if (value !== undefined) {
        document.documentElement.style.setProperty(key, value);
      }
    });
    // Broadcast to other widgets
    zebar.currentWidget().tauriWindow.emit('theme-preview-update', theme);
  }, []);

  const revertStyles = useCallback(() => {
    if (activeTheme) {
      // Re-apply active theme styles locally
      const colors = withDerivedThemeColors(activeTheme.colors);
      Object.entries(colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
    // Tell other widgets to revert
    zebar.currentWidget().tauriWindow.emit('theme-preview-revert');
  }, [activeTheme]);

  const startPreview = useCallback((themeToEdit: Theme) => {
    setPreviewTheme({ ...themeToEdit });
  }, []);

  const updatePreview = useCallback(
    (updatedProperties: Partial<Theme['colors']>) => {
      setPreviewTheme((currentPreview) => {
        if (!currentPreview) return null;
        const newColors = {
          ...currentPreview.colors,
          ...updatedProperties,
        } as Record<string, string>;
        const newPreview = {
          ...currentPreview,
          colors: newColors,
        };
        applyPreviewStyles(newPreview);
        return newPreview;
      });
    },
    [applyPreviewStyles]
  );

  const cancelPreview = useCallback(() => {
    setPreviewTheme(null);
    revertStyles();
  }, [revertStyles]);

  const savePreview = useCallback(
    (newThemeName: string) => {
      if (!previewTheme) return;

      // The 'id' from the preview is temporary, so we omit it.
      // The 'addTheme' function will generate a new, permanent id.
      const { id: _id, ...themeData } = previewTheme;
      const newThemeData = { ...themeData, name: newThemeName };

      const savedTheme = addTheme(newThemeData);

      setPreviewTheme(null);
      // No need to call revertStyles() here, because setActiveTheme will
      // trigger a global config change and apply the new theme everywhere.
      setActiveTheme(savedTheme.id);
    },
    [previewTheme, addTheme, setActiveTheme]
  );

  return {
    previewTheme,
    isPreviewing,
    startPreview,
    updatePreview,
    cancelPreview,
    savePreview,
  };
}
