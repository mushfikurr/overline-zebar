import { getCurrentWebview, type DragDropEvent } from '@tauri-apps/api/webview';
import { useEffect, type RefObject } from 'react';

interface UseTauriFileDropArgs {
  targetRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  onFile: (path: string) => void;
  onDragOverChange?: (isOver: boolean) => void;
}

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
    // eslint-disable-next-line
  }, [enabled, targetRef]);
}
