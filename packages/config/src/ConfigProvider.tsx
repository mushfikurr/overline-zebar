import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { RootConfig, defaultConfig } from './types';
import { configManager } from './ConfigManager';
import * as zebar from 'zebar';

type Action =
  | { type: 'SET_APP_SETTING'; key: keyof RootConfig['app']; value: any }
  | { type: 'SET_WIDGET_SETTING'; widget: string; key: string; value: any }
  | { type: 'LOAD_CONFIG'; config: RootConfig };

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
    const listen = async () => {
      await zebar.currentWidget().tauriWindow.listen('config-changed', () => {
        const reloaded = configManager.loadConfig(true); // Force reload
        dispatch({ type: 'LOAD_CONFIG', config: reloaded });
      });
    };

    listen();
  }, []);

  useEffect(() => {
    const loaded = configManager.loadConfig();
    dispatch({ type: 'LOAD_CONFIG', config: loaded });
  }, []);

  useEffect(() => {
    const theme = state.app.themes.find(
      (t) => t.name === state.app.currentTheme
    );
    if (theme) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  }, [state.app.currentTheme, state.app.themes]);

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
