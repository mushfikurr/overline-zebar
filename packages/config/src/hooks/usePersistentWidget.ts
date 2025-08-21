import { useEffect } from 'react';
import * as zebar from 'zebar';
import { WIDGET_IPC_CHANNEL, WidgetIpcPayload } from '../ipc-types';
import { logger } from '../utils/logger';

type UsePersistentWidgetProps = {
  widgetName: string;
  initialHide?: boolean;
  hideOnBlur?: boolean;
};

export function usePersistentWidget({
  widgetName,
  initialHide = true,
  hideOnBlur = true,
}: UsePersistentWidgetProps) {
  useEffect(() => {
    logger.log(`usePersistentWidget initialized for '${widgetName}'`);
    const listeners: Promise<() => void>[] = [];
    const window = zebar.currentWidget().tauriWindow;

    const unlistenManager = zebar
      .currentWidget()
      .tauriWindow.listen(WIDGET_IPC_CHANNEL, async (event) => {
        const {
          action,
          widgetName: targetWidget,
          payload,
        } = event.payload as WidgetIpcPayload;

        logger.log(
          `IPC event received on channel '${WIDGET_IPC_CHANNEL}':`,
          event.payload
        );

        if (targetWidget !== widgetName) {
          logger.log(
            `Event ignored: target '${targetWidget}' does not match self '${widgetName}'`
          );
          return;
        }

        logger.log(`Event accepted for '${widgetName}'. Action: '${action}'`);

        const isVisible = await zebar.currentWidget().tauriWindow.isVisible();
        logger.log(`Widget '${widgetName}' current visibility: ${isVisible}`);

        switch (action) {
          case 'toggle':
            if (isVisible) {
              logger.log(`Toggling: hiding widget '${widgetName}'`);
              await window.hide();
            } else {
              logger.log(`Toggling: showing widget '${widgetName}'`);
              await window.show();
              await window.setFocus();
            }
            break;
          case 'show':
            if (!isVisible) {
              logger.log(`Showing widget '${widgetName}'`);
              await window.show();
              await window.setFocus();
            } else {
              logger.log(`Widget '${widgetName}' is already visible.`);
            }
            break;
          case 'hide':
            if (isVisible) {
              logger.log(`Hiding widget '${widgetName}'`);
              await window.hide();
            } else {
              logger.log(`Widget '${widgetName}' is already hidden.`);
            }
            break;
        }
      });
    listeners.push(unlistenManager);

    if (hideOnBlur) {
      const unlistenBlur = zebar
        .currentWidget()
        .tauriWindow.listen('tauri://blur', () => {
          logger.log(`Hiding widget '${widgetName}' on blur event.`);
          window.hide();
        });
      listeners.push(unlistenBlur);
    }

    if (initialHide) {
      logger.log(`Hiding widget '${widgetName}' initially.`);
      window.hide();
    }

    return () => {
      logger.log(`Cleaning up listeners for '${widgetName}'`);
      listeners.forEach((l) => l.then((f) => f()));
    };
  }, [widgetName, initialHide, hideOnBlur]);
}
