import { RootConfig, WidgetSettingsMap } from '../types';
import { useConfigDispatch, useConfigState } from './useConfigContext';

export function useAppSetting<K extends keyof RootConfig['app']>(key: K) {
  const state = useConfigState();
  const dispatch = useConfigDispatch();
  return [
    state.app[key],
    (value: RootConfig['app'][K]) =>
      dispatch({
        type: 'SET_APP_SETTING',
        key: key as
          | 'useAutoTiling'
          | 'zebarWebsocketUri'
          | 'currentThemeId'
          | 'radius'
          | 'windowEffect'
          | 'fontFamily',
        value: value as unknown as 'useAutoTiling' extends K
          ? boolean
          : 'zebarWebsocketUri' extends K
            ? string
            : 'currentThemeId' extends K
              ? string
              : 'radius' extends K
                ? string
                : 'windowEffect' extends K
                  ? string
                  : 'fontFamily' extends K
                    ? string
                    : never,
      }),
  ] as const;
}

export function useWidgetSetting<
  W extends keyof WidgetSettingsMap,
  K extends keyof WidgetSettingsMap[W],
>(
  widgetName: W,
  key: K
): [WidgetSettingsMap[W][K], (value: WidgetSettingsMap[W][K]) => void] {
  const state = useConfigState();
  const dispatch = useConfigDispatch();

  const widgets = state.widgets as WidgetSettingsMap;
  const value = (widgets[widgetName] as Record<string, unknown>)?.[
    key as string
  ] as WidgetSettingsMap[W][K];

  const setValue = (value: WidgetSettingsMap[W][K]) => {
    dispatch({
      type: 'SET_WIDGET_SETTING',
      widget: widgetName,
      key: key as string,
      value,
    });
  };

  return [value, setValue];
}
