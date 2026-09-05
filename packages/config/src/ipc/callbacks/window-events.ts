import { Event } from '@tauri-apps/api/event';
import { Dispatch } from '../../ConfigReducer';

export async function listenForAlwaysOnEvents(
  widgetName: string,
  _event: Event<unknown>,
  _dispatch: Dispatch
): Promise<void> {
  // Stub implementation - alwaysOn functionality not yet implemented
  console.warn(
    'listenForAlwaysOnEvents not implemented for widget:',
    widgetName
  );
}
