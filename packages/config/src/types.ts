import { z } from 'zod';
import {
  AllWidgetSettingsSchema,
  AppSettingsSchema,
  LabelColorSchema,
  LauncherCommandSchema,
  MainWidgetSettingsSchema,
  ProviderSettingsSchema,
  RootConfigSchema,
  ThemeSchema,
  WeatherThresholdSchema,
} from './zod-types';

export type Theme = z.infer<typeof ThemeSchema>;
export type LabelColor = z.infer<typeof LabelColorSchema>;
export type WeatherThreshold = z.infer<typeof WeatherThresholdSchema>;
export type AppSettings = z.infer<typeof AppSettingsSchema>;
export type MainWidgetSettings = z.infer<typeof MainWidgetSettingsSchema>;
export type AllWidgetSettings = z.infer<typeof AllWidgetSettingsSchema>;
export type RootConfig = z.infer<typeof RootConfigSchema>;
export type ProviderSettings = z.infer<typeof ProviderSettingsSchema>;
export type LauncherCommand = z.infer<typeof LauncherCommandSchema>;
