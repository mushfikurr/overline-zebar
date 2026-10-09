import type { LauncherItem } from '@overline-zebar/config';
import { SortableContext, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { KeyboardEventHandler, ReactNode } from 'react';
import { LauncherTile } from './LauncherTile';
import type { LauncherItemInteraction, LauncherListState } from './types';

export function LauncherGridView({
  items,
  list,
  interactionFor,
  onKeyDown,
}: {
  items: LauncherItem[];
  list: LauncherListState;
  interactionFor: (item: LauncherItem) => LauncherItemInteraction;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
}) {
  if (items.length === 0) return null;

  return (
    <SortableContext
      items={items.map((item) => item.id)}
      strategy={rectSortingStrategy}
    >
      <div
        className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] content-start gap-1 p-2"
        onKeyDown={onKeyDown}
      >
        {items.map((item) => (
          <LauncherTile
            key={item.id}
            item={item}
            list={list}
            interaction={interactionFor(item)}
          />
        ))}
      </div>
    </SortableContext>
  );
}

export function LauncherListView({
  items,
  renderRow,
  onKeyDown,
}: {
  items: LauncherItem[];
  renderRow: (item: LauncherItem) => ReactNode;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
}) {
  if (items.length === 0) return null;

  return (
    <SortableContext
      items={items.map((item) => item.id)}
      strategy={verticalListSortingStrategy}
    >
      <div className="flex flex-col gap-0.5 p-2" onKeyDown={onKeyDown}>
        {items.map((item) => renderRow(item))}
      </div>
    </SortableContext>
  );
}
