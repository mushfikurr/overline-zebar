import { useConfigState, useConfigDispatch } from '../ConfigProvider';
import { RootConfig } from '../types';

export function useAppSetting<K extends keyof RootConfig['app']>(key: K) {
  const state = useConfigState();
  const dispatch = useConfigDispatch();
  return [
    state.app[key],
    (value: RootConfig['app'][K]) =>
      dispatch({ type: 'SET_APP_SETTING', key, value }),
  ] as const;
}

export function useWidgetSetting(widgetName: string, key: string) {
  const state = useConfigState();
  const dispatch = useConfigDispatch();
  return [
    state.widgets[widgetName]?.[key],
    (value: any) =>
      dispatch({ type: 'SET_WIDGET_SETTING', widget: widgetName, key, value }),
  ] as const;
}