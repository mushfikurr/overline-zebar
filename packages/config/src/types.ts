import { z } from 'zod';
import { catppuccinThemes, defaultTheme } from './presets';
import {
  ThemeSchema,
  LabelColorSchema,
  WeatherThresholdSchema,
  AppSettingsSchema,
  MainWidgetSettingsSchema,
  AllWidgetSettingsSchema,
  RootConfigSchema,
} from './zod-types';

export type Theme = z.infer<typeof ThemeSchema>;
export type LabelColor = z.infer<typeof LabelColorSchema>;
export type WeatherThreshold = z.infer<typeof WeatherThresholdSchema>;
export type AppSettings = z.infer<typeof AppSettingsSchema>;
export type MainWidgetSettings = z.infer<typeof MainWidgetSettingsSchema>;
export type AllWidgetSettings = z.infer<typeof AllWidgetSettingsSchema>;
export type RootConfig = z.infer<typeof RootConfigSchema>;

export const defaultConfig: RootConfig = {
  version: 1,
  app: {
    useAutoTiling: false,
    zebarWebsocketUri: 'ws://localhost:6123',
    themes: [defaultTheme, ...catppuccinThemes],
    currentThemeId: 'default',
    radius: '0.5rem',
  },
  widgets: {
    main: {
      flowLauncherPath: '',
      mediaMaxWidth: '400',
      weatherThresholds: [
        { id: 'weather-1', min: -10, max: 0, labelColor: '--danger' },
        { id: 'weather-2', min: 1, max: 15, labelColor: '--text' },
        { id: 'weather-3', min: 16, max: 25, labelColor: '--warning' },
        { id: 'weather-4', min: 26, max: 35, labelColor: '--danger' },
      ],
      pinnedSystrayIcons: [],
      weatherUnit: 'celsius',
      dynamicWorkspaceIndicator: false,
      marginX: 0,
      paddingLeft: 4,
      paddingRight: 4,
    },
  },
};
