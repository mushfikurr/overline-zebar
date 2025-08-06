import { SystrayIcon } from 'zebar';
import { catppuccinThemes, defaultTheme } from './presets';

export interface Theme {
  id: string;
  name: string;
  colors: {
    [key: string]: string;
  };
}

export type LabelColor = '--danger' | '--warning' | '--text';

export type WeatherThreshold = {
  id: string;
  min: number;
  max: number;
  labelColor: LabelColor;
};

export interface AppSettings {
  flowLauncherPath: string;
  useAutoTiling: boolean;
  zebarWebsocketUri: string;
  mediaMaxWidth: string;
  themes: Theme[];
  currentThemeId: string;
  weatherThresholds: WeatherThreshold[];
  weatherUnit: 'celsius' | 'fahrenheit';
  pinnedSystrayIcons: SystrayIcon[];
  pinnedSystrayIconsAmount: number;
}

export interface WidgetSettings {
  [key: string]: unknown;
}

export interface RootConfig {
  version: number;
  app: AppSettings;
  widgets: Record<string, WidgetSettings>;
}

export const defaultConfig: RootConfig = {
  version: 1,
  app: {
    flowLauncherPath: '',
    useAutoTiling: false,
    zebarWebsocketUri: 'ws://localhost:6123',
    mediaMaxWidth: '400',
    themes: [defaultTheme, ...catppuccinThemes],
    currentThemeId: 'default',
    weatherThresholds: [
      { id: 'weather-1', min: -10, max: 0, labelColor: '--danger' },
      { id: 'weather-2', min: 1, max: 15, labelColor: '--text' },
      { id: 'weather-3', min: 16, max: 25, labelColor: '--warning' },
      { id: 'weather-4', min: 26, max: 35, labelColor: '--danger' },
    ],
    pinnedSystrayIcons: [],
    pinnedSystrayIconsAmount: 4,
    weatherUnit: 'celsius',
  },
  widgets: {},
};
