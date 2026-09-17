/**
 * Tracks whether a native file dialog is currently open.
 *
 * Native file dialogs steal OS focus from the widget window, which fires
 * `tauri://blur` - widgets that close themselves on blur (like the script
 * launcher) use this to ignore those blurs. Module state is per-webview,
 * which matches how these components are used.
 */
let activeCount = 0;

export function beginFileDialog(): void {
  activeCount++;
}

export function endFileDialog(): void {
  activeCount = Math.max(0, activeCount - 1);
}

export function isFileDialogActive(): boolean {
  return activeCount > 0;
}
