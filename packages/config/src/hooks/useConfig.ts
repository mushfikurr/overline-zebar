import { useConfigDispatch, useConfigState } from '../ConfigProvider';
import { RootConfig } from '../types';

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
