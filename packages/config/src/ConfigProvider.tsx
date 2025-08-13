import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { RootConfig, Theme, defaultConfig } from './types';
import { configManager } from './ConfigManager';
import * as zebar from 'zebar';
import { RootConfigSchema } from './zod-types';
import { deepMerge } from './utils/deepMerge';

type Action =
  | {
      type: 'SET_APP_SETTING';
      key: Exclude<keyof RootConfig['app'], 'themes'>;
      value: RootConfig['app'][Exclude<keyof RootConfig['app'], 'themes'>];
    }
  | { type: 'SET_WIDGET_SETTING'; widget: string; key: string; value: unknown }
  | { type: 'LOAD_CONFIG'; config: RootConfig }
  | { type: 'ADD_THEME'; theme: Theme }
  | { type: 'UPDATE_THEME'; theme: Theme }
  | { type: 'DELETE_THEME'; themeId: string };

type Dispatch = (action: Action) => void;

type State = RootConfig;

const ConfigStateContext = createContext<State | undefined>(undefined);
const ConfigDispatchContext = createContext<Dispatch | undefined>(undefined);

function configReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_CONFIG':
      return action.config;
    case 'SET_APP_SETTING': {
      const newState = {
        ...state,
        app: { ...state.app, [action.key]: action.value },
      };
      configManager.saveConfig(newState);
      return newState;
    }
    case 'ADD_THEME': {
      const newThemes = [...state.app.themes, action.theme];
      const newState = {
        ...state,
        app: { ...state.app, themes: newThemes },
      };
      configManager.saveConfig(newState);
      return newState;
    }
    case 'UPDATE_THEME': {
      const newThemes = state.app.themes.map((t) =>
        t.id === action.theme.id ? action.theme : t
      );
      const newState = {
        ...state,
        app: { ...state.app, themes: newThemes },
      };
      configManager.saveConfig(newState);
      return newState;
    }
    case 'DELETE_THEME': {
      const newThemes = state.app.themes.filter((t) => t.id !== action.themeId);
      const newState = {
        ...state,
        app: { ...state.app, themes: newThemes },
      };
      configManager.saveConfig(newState);
      return newState;
    }
    case 'SET_WIDGET_SETTING': {
      const newWidgets = { ...state.widgets };
      newWidgets[action.widget] = {
        ...(newWidgets[action.widget] || {}),
        [action.key]: action.value,
      };
      const newState = { ...state, widgets: newWidgets };
      configManager.saveConfig(newState);
      return newState;
    }
    default:
      return state;
  }
}

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(configReducer, defaultConfig);

  useEffect(() => {
    const listenConfigChange = async () => {
      await zebar.currentWidget().tauriWindow.listen('config-changed', () => {
        const reloaded = configManager.loadConfig(true); // Force reload
        dispatch({ type: 'LOAD_CONFIG', config: reloaded });
      });
    };
    listenConfigChange();
  }, []);

  useEffect(() => {
    const listenThemePreview = async () => {
      await zebar
        .currentWidget()
        .tauriWindow.listen('theme-preview-update', (event) => {
          const previewTheme = event.payload as Theme;
          if (previewTheme) {
            Object.entries(previewTheme.colors).forEach(([key, value]) => {
              document.documentElement.style.setProperty(key, value);
            });
          }
        });

      await zebar
        .currentWidget()
        .tauriWindow.listen('theme-preview-revert', () => {
          const theme = state.app.themes.find(
            (t) => t.id === state.app.currentThemeId
          );
          if (theme) {
            Object.entries(theme.colors).forEach(([key, value]) => {
              document.documentElement.style.setProperty(key, value);
            });
          }
        });
    };

    listenThemePreview();
  }, [state.app.currentThemeId, state.app.themes]);

  useEffect(() => {
    const loaded = configManager.loadConfig();
    const validation = RootConfigSchema.safeParse(loaded);
    if (validation.success) {
      dispatch({ type: 'LOAD_CONFIG', config: validation.data });
    } else {
      const mergedConfig = deepMerge(defaultConfig, loaded);
      dispatch({ type: 'LOAD_CONFIG', config: mergedConfig });
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--radius', state.app.radius);
  }, [state.app.radius]);

  useEffect(() => {
    const theme = state.app.themes.find(
      (t) => t.id === state.app.currentThemeId
    );
    if (theme) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  }, [state.app.currentThemeId, state.app.themes]);

  return (
    <ConfigStateContext.Provider value={state}>
      <ConfigDispatchContext.Provider value={dispatch}>
        {children}
      </ConfigDispatchContext.Provider>
    </ConfigStateContext.Provider>
  );
};

export function useConfigState() {
  const context = useContext(ConfigStateContext);
  if (context === undefined) {
    throw new Error('useConfigState must be used within ConfigProvider');
  }
  return context;
}

export function useConfigDispatch() {
  const context = useContext(ConfigDispatchContext);
  if (context === undefined) {
    throw new Error('useConfigDispatch must be used within ConfigProvider');
  }
  return context;
}
