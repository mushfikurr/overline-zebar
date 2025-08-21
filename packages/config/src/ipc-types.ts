export const WIDGET_IPC_CHANNEL = 'widget-manager';

export type WidgetIpcAction = 'toggle' | 'show' | 'hide';

export type WidgetIpcPayload = {
  action: WidgetIpcAction;
  widgetName: string;
  // Optional payload for things like repositioning
  payload?: unknown;
};
