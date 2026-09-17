import { getCurrentWebview, type DragDropEvent } from '@tauri-apps/api/webview';
import { useEffect, type RefObject } from 'react';

interface UseTauriFileDropArgs {
  /** Element that accepts dropped files. */
  targetRef: RefObject<HTMLElement | null>;
  /** Whether the drop listener is active. */
  enabled: boolean;
  /** Called with the first dropped file's absolute path. */
  onFile: (path: string) => void;
  /** Called when the dragged file enters/leaves the target. */
  onDragOverChange?: (isOver: boolean) => void;
}

/**
 * Listens for native file drags (via Tauri's webview drag-drop events) and
 * reports the dropped file's absolute path when released over the target
 * element. DOM drop events don't fire in Tauri webviews, so positions from
 * the native events (physical px) are converted to CSS px for hit-testing.
 */
export function useTauriFileDrop({
  targetRef,
  enabled,
  onFile,
  onDragOverChange,
}: UseTauriFileDropArgs): void {
  useEffect(() => {
    if (!enabled) return;

    let disposed = false;
    let unlisten: (() => void) | undefined;

    const isOverTarget = (position: { x: number; y: number }): boolean => {
      const element = targetRef.current;
      if (!element) return false;

      const scale = window.devicePixelRatio || 1;
      const x = position.x / scale;
      const y = position.y / scale;
      const rect = element.getBoundingClientRect();

      return (
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      );
    };

    getCurrentWebview()
      .onDragDropEvent((event) => {
        const dragEvent = event.payload as DragDropEvent;

        switch (dragEvent.type) {
          case 'enter':
          case 'over':
            onDragOverChange?.(isOverTarget(dragEvent.position));
            break;
          case 'drop': {
            const isOver = isOverTarget(dragEvent.position);
            onDragOverChange?.(false);
            const path = dragEvent.paths[0];
            if (isOver && path) onFile(path);
            break;
          }
          case 'leave':
            onDragOverChange?.(false);
            break;
        }
      })
      .then((unsubscribe) => {
        if (disposed) unsubscribe();
        else unlisten = unsubscribe;
      });

    return () => {
      disposed = true;
      unlisten?.();
    };
    // Callbacks are intentionally excluded; callers should keep them stable.
    // eslint-disable-next-line
  }, [enabled, targetRef]);
}
