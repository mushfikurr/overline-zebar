import { createContext } from 'react';
import { AllWidgetSettings, RootConfig, Theme } from './types';
import { configService } from './ConfigService';

export type Action =
  | {
      type: 'SET_APP_SETTING';
      key: Exclude<keyof RootConfig['app'], 'themes'>;
      value: RootConfig['app'][Exclude<keyof RootConfig['app'], 'themes'>];
    }
  | { type: 'SET_WIDGET_SETTING'; widget: string; key: string; value: unknown }
  | { type: 'LOAD_CONFIG'; config: RootConfig }
  | { type: 'ADD_THEME'; theme: Theme }
  | { type: 'UPDATE_THEME'; theme: Theme }
  | { type: 'DELETE_THEME'; themeId: string }
  | {
      type: 'UPDATE_WIDGET_SETTINGS';
      widget: string;
      settings: Record<string, unknown>;
    }
  | {
      type: 'SET_WIDGET_VISIBILITY';
      widget: keyof AllWidgetSettings;
      visible: boolean;
    };

export type Dispatch = (action: Action) => void;
type State = RootConfig;

export const ConfigStateContext = createContext<State | undefined>(undefined);
export const ConfigDispatchContext = createContext<Dispatch | undefined>(
  undefined
);

export function configReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_CONFIG':
      return action.config;
    case 'SET_APP_SETTING': {
      return configService.updateAppSetting(action.key, action.value);
    }
    case 'ADD_THEME': {
      const freshConfig = configService.loadConfig(true);
      const newState = {
        ...freshConfig,
        app: {
          ...freshConfig.app,
          themes: [...freshConfig.app.themes, action.theme],
        },
      };
      configService.saveConfig(newState);
      return newState;
    }
    case 'UPDATE_THEME': {
      const freshConfig = configService.loadConfig(true);
      const newState = {
        ...freshConfig,
        app: {
          ...freshConfig.app,
          themes: freshConfig.app.themes.map((t) =>
            t.id === action.theme.id ? action.theme : t
          ),
        },
      };
      configService.saveConfig(newState);
      return newState;
    }
    case 'DELETE_THEME': {
      const freshConfig = configService.loadConfig(true);
      const newState = {
        ...freshConfig,
        app: {
          ...freshConfig.app,
          themes: freshConfig.app.themes.filter(
            (t) => t.id !== action.themeId
          ),
        },
      };
      configService.saveConfig(newState);
      return newState;
    }
    case 'UPDATE_WIDGET_SETTINGS': {
      return configService.updateWidgetSettings(
        action.widget as keyof AllWidgetSettings,
        action.settings
      );
    }
    case 'SET_WIDGET_SETTING': {
      return configService.updateWidgetSetting(
        action.widget as keyof AllWidgetSettings,
        action.key,
        action.value
      );
    }
    case 'SET_WIDGET_VISIBILITY': {
      const newWidgets = { ...state.widgets } as Record<string, unknown>;
      newWidgets[action.widget] = {
        ...((newWidgets[action.widget] as Record<string, unknown>) || {}),
        isVisible: action.visible,
      };
      return { ...state, widgets: newWidgets };
    }
    default:
      return state;
  }
}
