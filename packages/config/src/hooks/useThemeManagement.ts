import { useConfigDispatch, useConfigState } from '../ConfigProvider';
import { Theme } from '../types';

export function useAddTheme(): (theme: Theme) => void {
  const state = useConfigState();
  const dispatch = useConfigDispatch();

  const addTheme = (theme: Theme) => {
    const newThemes = [...state.app.themes, theme];
    dispatch({ type: 'SET_APP_SETTING', key: 'themes', value: newThemes });
  };

  return addTheme;
}

export function useRemoveTheme(): (themeName: string) => void {
  const state = useConfigState();
  const dispatch = useConfigDispatch();

  const removeTheme = (themeName: string) => {
    const newThemes = state.app.themes.filter((t) => t.name !== themeName);
    dispatch({ type: 'SET_APP_SETTING', key: 'themes', value: newThemes });
  };

  return removeTheme;
}

export function useSaveThemeAsNew(): (theme: Theme, newName: string) => void {
  const addTheme = useAddTheme();

  const saveThemeAsNew = (theme: Theme, newName: string) => {
    const newTheme = { ...theme, name: newName };
    addTheme(newTheme);
  };

  return saveThemeAsNew;
}

export function useThemeActions() {
  const addTheme = useAddTheme();
  const removeTheme = useRemoveTheme();
  const saveThemeAsNew = useSaveThemeAsNew();

  return {
    addTheme,
    removeTheme,
    saveThemeAsNew,
  };
}
