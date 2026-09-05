interface Config {
  [key: string]: string | boolean | number;
}

const loadConfig = async (): Promise<Config> => {
  try {
    // Use import.meta.env.BASE_URL to ensure correct path resolution in all environments
    const configPath = `${import.meta.env.BASE_URL}config.json`;
    console.info(`Attempting to load config from: ${configPath}`);

    const response = await fetch(configPath);
    if (!response.ok) {
      console.warn(
        `Config file not found or inaccessible at ${configPath}, status: ${response.status}, using default values`
      );
      return {};
    }

    const config = await response.json();
    console.info(
      `Successfully loaded config with keys: ${Object.keys(config).join(', ')}`
    );
    return config;
  } catch (error) {
    console.error('Error loading config.json, using default values:', error);
    return {};
  }
};

/**
 * Get a string value from the config file with a fallback
 * @param key - The key to look for in the config
 * @param fallback - The default value to use if the key is not found in the config
 * @returns The config value or the fallback
 */
export const getStringFromConfig = async (
  key: string,
  fallback: string
): Promise<string> => {
  const config = await loadConfig();
  const value = config[key];
  if (typeof value === 'string') {
    return value;
  }
  return fallback;
};

/**
 * Get a boolean value from the config file with a fallback
 * @param key - The key to look for in the config
 * @param fallback - The default value to use if the key is not found in the config
 * @returns The config value as a boolean or the fallback
 */
export const getBooleanFromConfig = async (
  key: string,
  fallback: boolean
): Promise<boolean> => {
  const config = await loadConfig();
  const value = config[key];

  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;

  // Handle string values like 'true', 'false'
  return value === 'true' || value === '1';
};

/**
 * Get a number value from the config file with a fallback
 * @param key - The key to look for in the config
 * @param fallback - The default value to use if the key is not found in the config
 * @returns The config value as a number or the fallback
 */
export const getNumberFromConfig = async (
  key: string,
  fallback: number
): Promise<number> => {
  const config = await loadConfig();
  const value = config[key];

  if (value === undefined) return fallback;

  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
};

export const getMediaMaxWidth = async (): Promise<string> => {
  return await getStringFromConfig('MEDIA_MAX_WIDTH', '400');
};

export const getUseAutoTiling = async (): Promise<boolean> => {
  return await getBooleanFromConfig('USE_AUTOTILING', false);
};

export const getAutoTilingWebSocketUri = async (): Promise<string> => {
  return await getStringFromConfig(
    'AUTOTILING_WEBSOCKET_URI',
    'ws://localhost:6123'
  );
};
