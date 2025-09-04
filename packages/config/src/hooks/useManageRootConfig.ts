import { configService } from '../ConfigService';
import { defaultConfig } from '../defaults/default-config';
import { RootConfigSchema } from '../zod-types';
import { useConfigDispatch, useConfigState } from './useConfigContext';

export function useManageRootConfig() {
  const dispatch = useConfigDispatch();
  const state = useConfigState();

  const resetConfig = () => {
    configService.saveConfig(defaultConfig);
    dispatch({ type: 'LOAD_CONFIG', config: defaultConfig });
  };

  const exportConfig = () => {
    return JSON.stringify(state, null, 2);
  };

  const importConfig = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      const validationResult = RootConfigSchema.safeParse(parsed);
      if (validationResult.success) {
        configService.saveConfig(validationResult.data);
        dispatch({ type: 'LOAD_CONFIG', config: validationResult.data });
        return { success: true };
      } else {
        console.error('Config validation error:', validationResult.error);
        return { success: false, error: validationResult.error };
      }
    } catch (error: unknown) {
      console.error('Error parsing config file:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  };

  return { resetConfig, exportConfig, importConfig };
}
