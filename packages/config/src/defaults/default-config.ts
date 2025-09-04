import { catppuccinThemes, defaultTheme } from '../defaults/theme-presets';
import { RootConfig } from '../types';

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
      providers: {
        cpu: true,
        memory: true,
        weather: true,
        battery: true,
      },
    },
    'script-launcher': {
      applications: [],
    },
  },
};
