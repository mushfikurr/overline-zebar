import { useEffect } from 'react';
import * as zebar from 'zebar';
import { configService } from '../../ConfigService';

export function useConfigChangeIpc(dispatch: any) {
  useEffect(() => {
    const listenConfigChange = async () => {
      await zebar.currentWidget().tauriWindow.listen('config-changed', () => {
        const reloaded = configService.loadConfig(true); // Force reload
        dispatch({ type: 'LOAD_CONFIG', config: reloaded });
      });
    };

    listenConfigChange();
  }, []);
}
