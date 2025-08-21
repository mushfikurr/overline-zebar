export { ConfigProvider } from './ConfigProvider';
export { useThemes } from './hooks/useThemes';
export { useThemePreview } from './hooks/useThemePreview';
export { useAppSetting, useWidgetSetting } from './hooks/useConfig';
export { useManageRootConfig } from './hooks/useManageRootConfig';
export { usePersistentWidget } from './hooks/usePersistentWidget';
export { defaultConfig } from './types';
export { defaultTheme } from './presets';
export { sendWidgetAction } from './ipc';
export type {
  AppSettings,
  WeatherThreshold,
  RootConfig,
  AllWidgetSettings,
  Theme,
  LabelColor,
  ProviderSettings,
} from './types';
export type { WidgetIpcAction, WidgetIpcPayload } from './ipc-types';
