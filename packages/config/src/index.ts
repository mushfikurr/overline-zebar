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
export {
  ICON_BACKGROUND_NONE,
  defaultIconBackground,
  iconBackgroundGradient,
  iconBackgroundPresets,
  resolveIconBackground,
  type IconBackgroundPreset,
  type ResolvedIconBackground,
} from './utils/icon-backgrounds';
export type {
  AllWidgetSettings,
  AppSettings,
  LabelColor,
  LauncherCommand,
  LauncherFolder,
  LauncherItem,
  MainWidgetSettings,
  ProviderSettings,
  RootConfig,
  ScriptLauncherWidgetSettings,
  Theme,
  Threshold,
  WidgetSettingsMap,
} from './types';
export { isLauncherFolder } from './types';
export {
  deleteFolderKeepChildren,
  getFolderCounts,
  groupIntoFolder,
  moveIntoFolder,
  moveToTopLevel,
  reorderBlockWithinLevel,
  reorderWithinLevel,
} from './launcher/transforms';
