import { Event } from '@tauri-apps/api/event';
import { useEffect } from 'react';
import * as zebar from 'zebar';
import { Dispatch } from '../../ConfigReducer';
import { AllWidgetSettings } from '../../types';
import { logger } from '../../utils/logger';
import { listenForAlwaysOnEvents } from '../callbacks/window-events';
import { WIDGET_IPC_CHANNEL, WidgetIpcPayload } from '../ipc-types';

/*
 * Handles listening for window events when alwaysOn is true
 * alwaysOn is a way to speed up window opening times, by using an internal state to show() or hide() widgets without actually opening them everytime.
 * It requires one initial load, and then past that it can be shown and hidden programatically
 * This hook handles the consumption of the ipcEvent required to make that work
 */

export function useAlwaysOnIpc(
  widgetName: keyof AllWidgetSettings,
  isAlwaysOn: boolean | undefined,
  hideOnBlur: boolean | undefined,
  dispatch: Dispatch
) {
  useEffect(() => {
    if (!isAlwaysOn) return;

    logger.log(`useWidget (persistent mode) initialized for '${widgetName}'`);
    const listeners: Promise<() => void>[] = [];
    const window = zebar.currentWidget().tauriWindow;

    const unlistenManager = zebar
      .currentWidget()
      .tauriWindow.listen(WIDGET_IPC_CHANNEL, async (event) =>
        listenForAlwaysOnEvents(
          widgetName,
          event as Event<WidgetIpcPayload>,
          dispatch
        )
      );

    listeners.push(unlistenManager);

    if (hideOnBlur) {
      const unlistenBlur = zebar
        .currentWidget()
        .tauriWindow.listen('tauri://blur', () => {
          window.hide();
        });
      listeners.push(unlistenBlur);
    }

    return () => {
      listeners.forEach((l) => l.then((f) => f()));
    };
  }, [widgetName, isAlwaysOn, hideOnBlur]);
}
