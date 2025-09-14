import { useEffect } from 'react';
import * as zebar from 'zebar';
import { configService } from '../../ConfigService';
import { Dispatch } from '../../ConfigReducer';

export function useConfigChangeIpc(dispatch: Dispatch) {
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
