import { useConfigDispatch, useConfigState } from '../ConfigProvider';
import { RootConfig, Theme } from '../types';

export function useAppSetting<K extends keyof RootConfig['app']>(
  key: K
): [RootConfig['app'][K], (value: RootConfig['app'][K]) => void] {
  const state = useConfigState();
  const dispatch = useConfigDispatch();

  const setValue = (value: RootConfig['app'][K]) => {
    dispatch({ type: 'SET_APP_SETTING', key, value });
  };

  return [state.app[key], setValue];
}

export function useWidgetSetting(
  widgetName: string,
  key: string,
  defaultValue: any = null
): [any, (value: any) => void] {
  const state = useConfigState();
  const dispatch = useConfigDispatch();

  const value = state.widgets[widgetName]?.[key] ?? defaultValue;

  const setValue = (newValue: any) => {
    dispatch({
      type: 'SET_WIDGET_SETTING',
      widget: widgetName,
      key,
      value: newValue,
    });
  };

  return [value, setValue];
}

export function useThemes(): [Theme[], (themes: Theme[]) => void] {
  const state = useConfigState();
  const dispatch = useConfigDispatch();

  const setThemes = (themes: Theme[]) => {
    dispatch({ type: 'SET_APP_SETTING', key: 'themes', value: themes });
  };

  return [state.app.themes, setThemes];
}

export function useTheme(): [Theme | undefined, (themeName: string) => void] {
  const state = useConfigState();
  const dispatch = useConfigDispatch();
  const { themes, currentTheme } = state.app;
  const theme = themes.find((t) => t.name === currentTheme);

  const setTheme = (themeName: string) => {
    dispatch({ type: 'SET_APP_SETTING', key: 'currentTheme', value: themeName });
  };

  return [theme, setTheme];
}

export function useThemeProperties(): (theme: Theme) => void {
  const state = useConfigState();
  const dispatch = useConfigDispatch();
  const { themes } = state.app;

  const setThemeProperties = (theme: Theme) => {
    const newThemes = themes.map((t) => (t.name === theme.name ? theme : t));
    dispatch({ type: 'SET_APP_SETTING', key: 'themes', value: newThemes });
  };

  return setThemeProperties;
}
