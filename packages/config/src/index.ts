export { ConfigProvider } from './ConfigProvider';
export {
  useAppSetting,
  useWidgetSetting,
  useTheme,
  useThemes,
  useThemeProperties,
} from './hooks/useConfig';
export { useDebouncedThemeProperties } from './hooks/useDebouncedThemeProperties';
export { defaultTheme } from './types';
export type {
  AppSettings,
  RootConfig,
  WidgetSettings,
  Theme,
} from './types';
