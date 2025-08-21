import * as zebar from 'zebar';
import {
  WIDGET_IPC_CHANNEL,
  WidgetIpcPayload,
  WidgetIpcAction,
} from './ipc-types';
import { logger } from './utils/logger';

export function sendWidgetAction(
  widgetName: string,
  action: WidgetIpcAction,
  payload?: unknown
) {
  const ipcPayload: WidgetIpcPayload = { action, widgetName, payload };
  logger.log(
    `Sending IPC action:`,
    `Channel: ${WIDGET_IPC_CHANNEL}`,
    `Payload:`,
    ipcPayload
  );
  zebar.currentWidget().tauriWindow.emit(WIDGET_IPC_CHANNEL, ipcPayload);
}
