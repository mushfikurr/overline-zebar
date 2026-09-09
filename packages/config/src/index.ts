export { ConfigProvider } from './ConfigProvider';
export { configService } from './ConfigService';
export { defaultConfig } from './defaults/default-config';
export { defaultTheme } from './defaults/theme-presets';
export { useAppSetting, useWidgetSetting } from './hooks/useConfig';
export { useConfigDispatch, useConfigState } from './hooks/useConfigContext';
export { useManageRootConfig } from './hooks/useManageRootConfig';
export { useThemePreview } from './hooks/useThemePreview';
export { useThemes } from './hooks/useThemes';
export { useSystemThemeSync } from './hooks/useSystemThemeSync';
export { generateThemeFromColor } from './utils/theme-generator';
export type {
  AllWidgetSettings,
  AppSettings,
  LabelColor,
  MainWidgetSettings,
  ProviderSettings,
  RootConfig,
  ScriptLauncherWidgetSettings,
  Theme,
  Threshold,
  WidgetSettingsMap,
} from './types';
