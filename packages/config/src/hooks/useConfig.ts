import { AllWidgetSettings, RootConfig } from '../types';
import { useConfigDispatch, useConfigState } from './useConfigContext';

export function useAppSetting<K extends keyof RootConfig['app']>(key: K) {
  const state = useConfigState();
  const dispatch = useConfigDispatch();
  return [
    state.app[key],
    (value: RootConfig['app'][K]) =>
      dispatch({ type: 'SET_APP_SETTING', key, value }),
  ] as const;
}

export function useWidgetSetting<
  T extends keyof AllWidgetSettings,
  K extends keyof AllWidgetSettings[T],
>(widgetName: T, key: K) {
  const state = useConfigState();
  const dispatch = useConfigDispatch();

  const value = state.widgets[widgetName]?.[key];

  const setValue = (value: AllWidgetSettings[T][K]) => {
    dispatch({ type: 'SET_WIDGET_SETTING', widget: widgetName, key, value });
  };

  return [value, setValue] as const;
}
