import { useCallback, useMemo } from 'react';
import { useConfigState, useConfigDispatch } from '../ConfigProvider';
import { Theme } from '../types';
import { defaultConfig } from '../types';
import { generateId } from '../utils/generateId';

export function useThemes() {
  const { app } = useConfigState();
  const dispatch = useConfigDispatch();

  const themes = app.themes;
  const activeTheme = themes.find((t) => t.id === app.currentThemeId);

  const defaultThemeIds = useMemo(
    () => defaultConfig.app.themes.map((t) => t.id),
    []
  );

  const isDefault = useCallback(
    (themeId: string) => {
      return defaultThemeIds.includes(themeId);
    },
    [defaultThemeIds]
  );

  const setActiveTheme = useCallback(
    (themeId: string) => {
      dispatch({
        type: 'SET_APP_SETTING',
        key: 'currentThemeId',
        value: themeId,
      });
    },
    [dispatch]
  );

  const addTheme = useCallback(
    (themeData: Omit<Theme, 'id'>): Theme => {
      const newTheme = { ...themeData, id: generateId() };
      const newThemes = [...themes, newTheme];
      dispatch({ type: 'SET_APP_SETTING', key: 'themes', value: newThemes });
      return newTheme;
    },
    [dispatch, themes]
  );

  const deleteTheme = useCallback(
    (themeId: string) => {
      const newThemes = themes.filter((t) => t.id !== themeId);
      dispatch({ type: 'SET_APP_SETTING', key: 'themes', value: newThemes });
      if (app.currentThemeId === themeId) {
        setActiveTheme(defaultConfig.app.currentThemeId);
      }
    },
    [dispatch, themes, app.currentThemeId, setActiveTheme]
  );

  return {
    themes,
    activeTheme,
    isDefault,
    setActiveTheme,
    addTheme,
    deleteTheme,
  };
}
