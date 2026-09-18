import type { LauncherItem } from '@overline-zebar/config';
import {
  useCallback,
  useEffect,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import type { LauncherApplicationsModel } from '../model/useLauncherApplications';

/**
 * Ctrl/shift-click multi-selection over launcher items, shared by the
 * launcher widget and the settings applications tab. Folders select like
 * scripts; plain clicks are left to the hosting surface.
 *
 * `handleSelectClick` consumes modifier clicks (and returns true); when
 * it returns false the surface runs its own plain-click behavior
 * (launch, open folder, edit, rename). `handleBackgroundClick` clears
 * the selection when a click misses every item; the hosting surface
 * attaches it to its list background.
 */
export function useLauncherSelection({
  model,
  orderedItems,
  escapeClears = false,
}: {
  model: LauncherApplicationsModel;
  /** The items in display order; shift-range selection runs over it. */
  orderedItems: LauncherItem[];
  /** Whether Escape clears the selection. The launcher walks out with
   * its own Escape handling, so it opts out. */
  escapeClears?: boolean;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const clearSelection = useCallback(() => {
    setSelectedIds((prev) => (prev.length > 0 ? [] : prev));
  }, []);

  // Items can disappear behind the surface's back (deleted from the
  // other surface); keep the selection free of stale ids.
  useEffect(() => {
    setSelectedIds((prev) => {
      const next = prev.filter((id) =>
        model.applications.some((item) => item.id === id)
      );
      return next.length === prev.length ? prev : next;
    });
  }, [model.applications]);

  /** Handles ctrl/shift clicks. Returns true when the click was consumed
   * as a selection gesture; false means a plain click. */
  const handleSelectClick = useCallback(
    (item: LauncherItem, event: ReactMouseEvent): boolean => {
      const index = orderedItems.findIndex((visible) => visible.id === item.id);
      if (index === -1) return false;

      if (event.shiftKey) {
        // Shift extends the selection: everything between the topmost
        // and bottommost selected items (plus the clicked one) becomes
        // selected, without dropping what was already picked.
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

  /** Clears the selection when a click lands on the list background
   * instead of on an item (works with or without modifiers). */
  const handleBackgroundClick = useCallback(
    (event: ReactMouseEvent) => {
      if ((event.target as HTMLElement).closest('[data-launcher-id]')) return;
      clearSelection();
    },
    [clearSelection]
  );

  // Ctrl+A selects every visible item (folders included) for bulk
  // actions; skipped while typing so text fields keep native
  // select-all.
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
      if (event.key === 'Escape') clearSelection();
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

/** Selection controller shape consumed by the drag & drop layer. */
export type LauncherSelection = ReturnType<typeof useLauncherSelection>;
