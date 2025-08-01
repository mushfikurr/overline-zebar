export { ConfigProvider } from './ConfigProvider';
export {
  useAppSetting,
  useWidgetSetting,
  useTheme,
  useThemes,
  useThemeProperties,
} from './hooks/useConfig';
export { useDebouncedThemeProperties } from './hooks/useDebouncedThemeProperties';
export { useThemeActions } from './hooks/useThemeManagement';
export { defaultTheme, defaultConfig } from './types';
export type {
  AppSettings,
  RootConfig,
  WidgetSettings,
  Theme,
} from './types';