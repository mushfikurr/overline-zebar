export interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
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
    theme: 'light',
    language: 'en',
  },
  widgets: {},
};
