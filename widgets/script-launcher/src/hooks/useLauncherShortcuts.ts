import { useEffect } from 'react';
import * as zebar from 'zebar';
import { isFileDialogActive } from '@/utils/fileDialogGuard';

/**
 * Global window shortcuts: blur-to-close and the Escape ladder
 * (selection -> query -> folder -> close).
 */
export function useLauncherShortcuts({
  hasSelection,
  onClearSelection,
  query,
  onClearQuery,
  currentFolderId,
  onExitFolder,
}: {
  hasSelection: boolean;
  onClearSelection: () => void;
  query: string;
  onClearQuery: () => void;
  currentFolderId: string | null;
  onExitFolder: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;

      if (hasSelection) {
        onClearSelection();
        return;
      }

      if (query) {
        onClearQuery();
        return;
      }

      if (currentFolderId) {
        onExitFolder();
        return;
      }

      zebar.currentWidget().close();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    hasSelection,
    onClearSelection,
    query,
    onClearQuery,
    currentFolderId,
    onExitFolder,
  ]);

  useEffect(() => {
    zebar.currentWidget().tauriWindow.listen('tauri://blur', () => {
      if (isFileDialogActive()) return;
      zebar.currentWidget().close();
    });
  }, []);
}
