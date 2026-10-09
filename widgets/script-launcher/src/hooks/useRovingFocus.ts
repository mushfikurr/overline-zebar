import { useCallback } from 'react';
import type { KeyboardEvent } from 'react';

const ITEM_SELECTOR = '[data-launcher-item]';

export function useRovingFocus() {
  const moveFocus = useCallback((event: KeyboardEvent, columns: number) => {
    if (event.defaultPrevented) return;
    const items = Array.from(
      (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
        ITEM_SELECTOR
      )
    );
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (index === -1) return;

    let next = -1;
    switch (event.key) {
      case 'ArrowRight':
        next = index + 1;
        break;
      case 'ArrowLeft':
        next = index - 1;
        break;
      case 'ArrowDown':
        next = index + columns;
        break;
      case 'ArrowUp':
        next = index - columns;
        break;
      default:
        return;
    }
    if (next < 0 || next >= items.length) return;

    event.preventDefault();
    items[next]?.focus();
  }, []);

  const handleGridKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!event.key.startsWith('Arrow')) return;
      const columns = getComputedStyle(
        event.currentTarget as HTMLElement
      ).gridTemplateColumns.split(' ').length;
      moveFocus(event, columns);
    },
    [moveFocus]
  );

  const handleListKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        moveFocus(event, 1);
      }
    },
    [moveFocus]
  );

  return { handleGridKeyDown, handleListKeyDown };
}
