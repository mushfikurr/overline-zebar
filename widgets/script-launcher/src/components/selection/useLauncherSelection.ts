import type { LauncherItem } from '@overline-zebar/config';
import {
  useCallback,
  useEffect,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import type { LauncherApplicationsModel } from '@/hooks/useLauncherApplications';

export function useLauncherSelection({
  model,
  orderedItems,
  escapeClears = false,
}: {
  model: LauncherApplicationsModel;
  orderedItems: LauncherItem[];
  escapeClears?: boolean;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const clearSelection = useCallback(() => {
    setSelectedIds((prev) => (prev.length > 0 ? [] : prev));
  }, []);

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = prev.filter((id) =>
        model.applications.some((item) => item.id === id)
      );
      return next.length === prev.length ? prev : next;
    });
  }, [model.applications]);

  const handleSelectClick = useCallback(
    (item: LauncherItem, event: ReactMouseEvent): boolean => {
      const index = orderedItems.findIndex((visible) => visible.id === item.id);
      if (index === -1) return false;

      if (event.shiftKey) {
        let start = index;
        let end = index;
        orderedItems.forEach((visible, visibleIndex) => {
          if (!selectedIds.includes(visible.id)) return;
          start = Math.min(start, visibleIndex);
          end = Math.max(end, visibleIndex);
        });
        const range = orderedItems
          .slice(start, end + 1)
          .map((visible) => visible.id);
        setSelectedIds((prev) => Array.from(new Set([...prev, ...range])));
        return true;
      }

      if (event.ctrlKey || event.metaKey) {
        setSelectedIds((prev) =>
          prev.includes(item.id)
            ? prev.filter((id) => id !== item.id)
            : [...prev, item.id]
        );
        return true;
      }

      return false;
    },
    [orderedItems, selectedIds]
  );

  const handleBackgroundClick = useCallback(
    (event: ReactMouseEvent) => {
      if ((event.target as HTMLElement).closest('[data-launcher-id]')) return;
      clearSelection();
    },
    [clearSelection]
  );

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'a')
        return;
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      ) {
        return;
      }
      if (orderedItems.length === 0) return;
      event.preventDefault();
      setSelectedIds(orderedItems.map((item) => item.id));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [orderedItems]);

  useEffect(() => {
    if (!escapeClears) return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== 'Escape') return;
      clearSelection();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [escapeClears, clearSelection]);

  return {
    selectedIds,
    clearSelection,
    handleSelectClick,
    handleBackgroundClick,
  };
}

export type LauncherSelection = ReturnType<typeof useLauncherSelection>;
