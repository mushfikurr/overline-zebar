import React, { useEffect, useReducer } from 'react';
import {
  ConfigDispatchContext,
  configReducer,
  ConfigStateContext,
} from './ConfigReducer';
import { configService } from './ConfigService';
import { defaultConfig } from './defaults/default-config';
import { useConfigChangeIpc } from './ipc/hooks/useConfigChangeIpc';
import { useThemePreviewIpc } from './ipc/hooks/useThemePreviewIpc';
import { AllWidgetSettings } from './types';
import { deepMerge } from './utils/deepMerge';
import { RootConfigSchema } from './zod-types';

const getInitialState = () => {
  const loaded = configService.loadConfig();
  const validation = RootConfigSchema.safeParse(loaded);
  if (validation.success) {
    return validation.data;
  } else {
    const mergedConfig = deepMerge(defaultConfig, loaded);
    return mergedConfig;
  }
};

/*
 * ConfigProvider is the main component that handles the entire config system
 * It provides a context to all widgets, and also enables IPC communication between them
 */

export const ConfigProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, dispatch] = useReducer(configReducer, getInitialState());

  // Register IPC hooks
  useThemePreviewIpc(state);
  useConfigChangeIpc(dispatch);

  // Sync radius changes to the document to ALL widgets
  // TODO: Integrate with theme
  useEffect(() => {
    document.documentElement.style.setProperty('--radius', state.app.radius);
  }, [state.app.radius]);

  // Sync theme changes to the document to ALL widgets
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
