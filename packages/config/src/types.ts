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
  useAutoTiling: boolean;
  zebarWebsocketUri: string;
  themes: Theme[];
  currentThemeId: string;
}

export interface MainWidgetSettings {
  flowLauncherPath: string;
  mediaMaxWidth: string;
  weatherThresholds: WeatherThreshold[];
  weatherUnit: 'celsius' | 'fahrenheit';
  pinnedSystrayIcons: SystrayIcon[];
}

export interface AllWidgetSettings {
  main: MainWidgetSettings;
}

export interface RootConfig {
  version: number;
  app: AppSettings;
  widgets: Partial<AllWidgetSettings>;
}

export const defaultConfig: RootConfig = {
  version: 1,
  app: {
    useAutoTiling: false,
    zebarWebsocketUri: 'ws://localhost:6123',
    themes: [defaultTheme, ...catppuccinThemes],
    currentThemeId: 'default',
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
    },
  },
};
