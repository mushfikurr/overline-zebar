import { useConfigState, useConfigDispatch } from '../ConfigProvider';
import { Theme } from '../types';

export function useThemeActions() {
  const dispatch = useConfigDispatch();
  const { app } = useConfigState();

  const saveThemeAsNew = (theme: Theme, newName: string) => {
    const newTheme = { ...theme, name: newName };
    const newThemes = [...app.themes, newTheme];
    dispatch({ type: 'SET_APP_SETTING', key: 'themes', value: newThemes });
  };

  const removeTheme = (themeName: string) => {
    const newThemes = app.themes.filter((t) => t.name !== themeName);
    dispatch({ type: 'SET_APP_SETTING', key: 'themes', value: newThemes });
  };

  return { saveThemeAsNew, removeTheme };
}
