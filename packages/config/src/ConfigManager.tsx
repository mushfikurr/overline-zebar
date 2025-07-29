import { RootConfig, defaultConfig } from './types';

const STORAGE_KEY = 'overline-zebar-config';

let cachedConfig: RootConfig | null = null;

function loadConfig(): RootConfig {
  if (cachedConfig) return cachedConfig;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    cachedConfig = defaultConfig;
    saveConfig(cachedConfig);
    return cachedConfig;
  }

  try {
    const parsed = JSON.parse(stored) as RootConfig;

    // if (parsed.version < CURRENT_VERSION) parsed = migrate(parsed);

    cachedConfig = { ...defaultConfig, ...parsed };
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
}

function updateAppSetting<K extends keyof RootConfig['app']>(
  key: K,
  value: RootConfig['app'][K]
) {
  const config = loadConfig();
  config.app[key] = value;
  saveConfig(config);
}

function updateWidgetSetting(widgetName: string, key: string, value: any) {
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

function getWidgetSetting(widgetName: string, key: string): any {
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
