import { z } from 'zod';
import {
  AllWidgetSettingsSchema,
  AppSettingsSchema,
  LabelColorSchema,
  LauncherCommandSchema,
  LauncherFolderSchema,
  LauncherItemSchema,
  MainWidgetSettingsSchema,
  ProviderSettingsSchema,
  RootConfigSchema,
  ScriptLauncherWidgetSettingsSchema,
  ThemeSchema,
  ThresholdSchema,
} from './zod-types';

export type Theme = z.infer<typeof ThemeSchema>;
export type LabelColor = z.infer<typeof LabelColorSchema>;
export type Threshold = z.infer<typeof ThresholdSchema>;
export type AppSettings = z.infer<typeof AppSettingsSchema>;
export type MainWidgetSettings = z.infer<typeof MainWidgetSettingsSchema>;
export type ScriptLauncherWidgetSettings = z.infer<
  typeof ScriptLauncherWidgetSettingsSchema
>;
export type AllWidgetSettings = z.infer<typeof AllWidgetSettingsSchema>;
export type RootConfig = z.infer<typeof RootConfigSchema>;
export type ProviderSettings = z.infer<typeof ProviderSettingsSchema>;
export type LauncherCommand = z.infer<typeof LauncherCommandSchema>;
export type LauncherFolder = z.infer<typeof LauncherFolderSchema>;
export type LauncherItem = z.infer<typeof LauncherItemSchema>;

export function isLauncherFolder(item: LauncherItem): item is LauncherFolder {
  return item.type === 'folder';
}

export type WidgetSettingsMap = {
  main: MainWidgetSettings;
  'script-launcher': ScriptLauncherWidgetSettings;
  'config-widget': Record<string, unknown>;
};
