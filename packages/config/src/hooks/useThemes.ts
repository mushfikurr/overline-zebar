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
      dispatch({ type: 'ADD_THEME', theme: newTheme });
      return newTheme;
    },
    [dispatch]
  );

  const updateTheme = useCallback(
    (theme: Theme) => {
      dispatch({ type: 'UPDATE_THEME', theme });
    },
    [dispatch]
  );

  const deleteTheme = useCallback(
    (themeId: string) => {
      dispatch({ type: 'DELETE_THEME', themeId });
      if (app.currentThemeId === themeId) {
        setActiveTheme(defaultConfig.app.currentThemeId);
      }
    },
    [dispatch, app.currentThemeId, setActiveTheme]
  );

  return {
    themes,
    activeTheme,
    isDefault,
    setActiveTheme,
    addTheme,
    updateTheme,
    deleteTheme,
  };
}
