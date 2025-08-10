import { useConfigDispatch } from '../ConfigProvider';
import { defaultConfig } from '../types';

export function useResetRootConfig() {
  const dispatch = useConfigDispatch();

  const reset = () => {
    dispatch({ type: 'LOAD_CONFIG', config: defaultConfig });
  };

  return reset;
}
