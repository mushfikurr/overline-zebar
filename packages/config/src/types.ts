import { defaultTheme, catppuccinThemes } from './presets';

export interface Theme {
  id: string;
  name: string;
  colors: {
    [key: string]: string;
  };
}

export interface AppSettings {
  flowLauncherPath: string;
  useAutoTiling: boolean;
  zebarWebsocketUri: string;
  mediaMaxWidth: string;
  themes: Theme[];
  currentThemeId: string;
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
  },
  widgets: {},
};