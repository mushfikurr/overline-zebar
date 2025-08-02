import { RootConfig, defaultConfig } from './types';
import * as zebar from 'zebar';
import { deepMerge } from './utils/deepMerge';

const STORAGE_KEY = 'overline-zebar-config';

let cachedConfig: RootConfig | null = null;

import { generateId } from './utils/generateId';

function loadConfig(forceReload = false): RootConfig {
  if (cachedConfig && !forceReload) return cachedConfig;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    cachedConfig = defaultConfig;
    saveConfig(cachedConfig);
    return cachedConfig;
  }

  try {
    const parsed = JSON.parse(stored) as RootConfig;

    // Ensure all themes have an ID
    parsed.app.themes.forEach((theme) => {
      if (!theme.id) {
        theme.id = generateId();
      }
    });

    // if (parsed.version < CURRENT_VERSION) parsed = migrate(parsed);

    cachedConfig = deepMerge(defaultConfig, parsed);

    return cachedConfig;
  } catch {
    cachedConfig = defaultConfig;
    saveConfig(cachedConfig);
    return cachedConfig;
  }
}

function saveConfig(config: RootConfig) {
  cachedConfig = config;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  zebar.currentWidget().tauriWindow.emit('config-changed');
}

function updateAppSetting<K extends keyof RootConfig['app']>(
  key: K,
  value: RootConfig['app'][K]
) {
  const config = loadConfig();
  config.app[key] = value;
  saveConfig(config);
}

function updateWidgetSetting(widgetName: string, key: string, value: unknown) {
  const config = loadConfig();
  if (!config.widgets[widgetName]) {
    config.widgets[widgetName] = {};
  }
  config.widgets[widgetName][key] = value;
  saveConfig(config);
}

function getAppSetting<K extends keyof RootConfig['app']>(
  key: K
): RootConfig['app'][K] {
  return loadConfig().app[key];
}

function getWidgetSetting(widgetName: string, key: string): unknown {
  return loadConfig().widgets[widgetName]?.[key];
}

export const configManager = {
  loadConfig,
  saveConfig,
  updateAppSetting,
  updateWidgetSetting,
  getAppSetting,
  getWidgetSetting,
};
