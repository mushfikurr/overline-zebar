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
  autoTilingWebSocketUri: string;
  mediaMaxWidth: string;
  themes: Theme[];
  currentThemeId: string;
}

export interface WidgetSettings {
  [key: string]: any;
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
    autoTilingWebSocketUri: 'ws://localhost:6123',
    mediaMaxWidth: '400',
    themes: [defaultTheme, ...catppuccinThemes],
    currentThemeId: 'default',
  },
  widgets: {},
};

