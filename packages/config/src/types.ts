export interface Theme {
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
  currentTheme: string;
}

export interface WidgetSettings {
  [key: string]: any;
}

export interface RootConfig {
  version: number;
  app: AppSettings;
  widgets: Record<string, WidgetSettings>;
}

export const defaultTheme: Theme = {
  name: 'Default',
  colors: {
    '--border': 'oklch(0.35 0.024 261.7)',
    '--background': 'oklch(0.25 0.013 261.7)',
    '--background-deeper': 'oklch(0.15 0.008 261.7)',
    '--button': 'oklch(0.35 0.019 261.7)',
    '--button-border': 'oklch(0.45 0.024 261.7)',
    '--primary': 'oklch(0.542 0.041 248.7)',
    '--primary-border': 'oklch(0.623 0.047 248.7)',
    '--text': 'oklch(0.95 0.003 261.7)',
    '--text-muted': 'oklch(0.85 0.009 261.7)',
    '--icon': 'oklch(0.75 0.015 261.7)',
    '--success': '#a3be8c',
    '--danger': '#bf616a',
    '--warning': '#d08770',
  },
};

export const defaultConfig: RootConfig = {
  version: 1,
  app: {
    flowLauncherPath: '',
    useAutoTiling: false,
    autoTilingWebSocketUri: 'ws://localhost:6123',
    mediaMaxWidth: '400',
    themes: [defaultTheme],
    currentTheme: 'Default',
  },
  widgets: {},
};
