import { RootConfig, WidgetSettingsMap } from '../types';
import { defaultConfig } from '../defaults/default-config';
import { deepEqual } from '../utils/deep-equal';
import { useConfigDispatch, useConfigState } from './useConfigContext';

export function useAppSetting<K extends keyof RootConfig['app']>(key: K) {
  const state = useConfigState();
  const dispatch = useConfigDispatch();

  const value = state.app[key];
  const [isDefault, reset] = useAppSettingDefaults([key]);

  const setValue = (value: RootConfig['app'][K]) =>
    dispatch({
      type: 'SET_APP_SETTING',
      key: key as
        | 'useAutoTiling'
        | 'zebarWebsocketUri'
        | 'currentThemeId'
        | 'radius'
        | 'windowEffect'
        | 'fontFamily'
        | 'systemThemeSync'
        | 'lightThemeId'
        | 'darkThemeId',
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
                  : 'systemThemeSync' extends K
                    ? boolean
                    : 'lightThemeId' extends K
                      ? string | null
                      : 'darkThemeId' extends K
                        ? string | null
                        : never,
    });

  return [value, setValue, isDefault, reset] as const;
}

export function useWidgetSetting<
  W extends keyof WidgetSettingsMap,
  K extends keyof WidgetSettingsMap[W],
>(
  widgetName: W,
  key: K
): [
  WidgetSettingsMap[W][K],
  (value: WidgetSettingsMap[W][K]) => void,
  boolean,
  () => void,
] {
  const state = useConfigState();
  const dispatch = useConfigDispatch();

  const widgets = state.widgets as WidgetSettingsMap;
  const value = (widgets[widgetName] as Record<string, unknown>)?.[
    key as string
  ] as WidgetSettingsMap[W][K];

  const [isDefault, reset] = useWidgetSettingDefaults(widgetName, [key]);

  const setValue = (value: WidgetSettingsMap[W][K]) => {
    dispatch({
      type: 'SET_WIDGET_SETTING',
      widget: widgetName,
      key: key as string,
      value,
    });
  };

  return [value, setValue, isDefault, reset];
}

export function useAppSettingDefaults(
  keys: readonly (keyof RootConfig['app'])[]
): [boolean, () => void] {
  const state = useConfigState();
  const dispatch = useConfigDispatch();

  const isDefault = keys.every((key) =>
    deepEqual(state.app[key], defaultConfig.app[key])
  );

  const reset = () => {
    for (const key of keys) {
      dispatch({
        type: 'SET_APP_SETTING',
        key: key as Exclude<keyof RootConfig['app'], 'themes'>,
        value:
          defaultConfig.app[key as Exclude<keyof RootConfig['app'], 'themes'>],
      });
    }
  };

  return [isDefault, reset];
}

export function useWidgetSettingDefaults<
  W extends keyof WidgetSettingsMap,
  K extends keyof WidgetSettingsMap[W],
>(widgetName: W, keys: readonly K[]): [boolean, () => void] {
  const state = useConfigState();
  const dispatch = useConfigDispatch();

  const widgets = state.widgets as WidgetSettingsMap;
  const defaultWidgets = defaultConfig.widgets as WidgetSettingsMap;
  const current = widgets[widgetName] as Record<string, unknown> | undefined;
  const defaults = defaultWidgets[widgetName] as
    | Record<string, unknown>
    | undefined;

  const isDefault = keys.every((key) =>
    deepEqual(current?.[key as string], defaults?.[key as string])
  );

  const reset = () => {
    for (const key of keys) {
      dispatch({
        type: 'SET_WIDGET_SETTING',
        widget: widgetName,
        key: key as string,
        value: defaults?.[key as string],
      });
    }
  };

  return [isDefault, reset];
}
