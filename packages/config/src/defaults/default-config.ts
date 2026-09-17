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
    windowEffect: 'acrylic',
    fontFamily: 'Geist Mono',
    systemThemeSync: false,
    lightThemeId: 'latte',
    darkThemeId: 'default',
  },
  widgets: {
    main: {
      mediaMaxWidth: '400',
      weatherThresholds: [
        { id: 'weather-1', min: -10, max: 0, labelColor: '--danger' },
        { id: 'weather-2', min: 1, max: 15, labelColor: '--text' },
        { id: 'weather-3', min: 16, max: 25, labelColor: '--warning' },
        { id: 'weather-4', min: 26, max: 35, labelColor: '--danger' },
      ],
      systemStatThresholds: [
        { id: 'stat-1', min: 0, max: 70, labelColor: '--text' },
        { id: 'stat-2', min: 70, max: 85, labelColor: '--warning' },
        { id: 'stat-3', min: 85, max: 100, labelColor: '--danger' },
      ],
      batteryThresholds: [
        { id: 'battery-1', min: 0, max: 20, labelColor: '--danger' },
        { id: 'battery-2', min: 20, max: 60, labelColor: '--warning' },
        { id: 'battery-3', min: 60, max: 100, labelColor: '--text' },
      ],
      useInlineStats: false,
      pinnedSystrayIcons: [],
      showSystray: true,
      weatherUnit: 'celsius',
      dynamicWorkspaceIndicator: false,
      marginX: 0,
      paddingLeft: 4,
      paddingRight: 4,
      timeFormat: 'EEE d MMM t',
      timeLocale: 'en-GB',
      providers: {
        cpu: true,
        memory: true,
        weather: true,
        battery: true,
      },
    },
    'script-launcher': {
      applications: [],
      view: 'grid',
      showCommands: true,
      collapsePaths: false,
    },
  },
};
