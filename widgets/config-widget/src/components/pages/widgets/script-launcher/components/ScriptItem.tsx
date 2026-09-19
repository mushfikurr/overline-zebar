import type { LauncherCommand, LauncherItem } from '@overline-zebar/config';
import {
  LauncherItemBadges,
  launcherItemStateClasses,
  useSortableItem,
  type LauncherDragDelta,
} from '@overline-zebar/script-launcher';
import { Item } from '@overline-zebar/ui';
import { cn } from '@/utils/cn';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { ItemActionButtons } from './ItemActionButtons';
import { ScriptItemContent } from './ScriptItemContent';

export function ScriptItem({
  app,
  isDwellTarget,
  isFolderTarget,
  isSelected,
  isGhostMover,
  dragDelta,
  onItemClick,
  onActivate,
  onEdit,
  onRequestDelete,
}: {
  app: LauncherCommand;
  isDwellTarget: boolean;
  isFolderTarget: boolean;
  isSelected: boolean;
  isGhostMover: boolean;
  dragDelta: LauncherDragDelta;
  onItemClick: (item: LauncherItem, event: ReactMouseEvent) => void;
  onActivate: (item: LauncherItem) => void;
  onEdit: (app: LauncherCommand) => void;
  onRequestDelete: (app: LauncherCommand) => void;
}) {
  const { dragProps, setNodeRef, style, className } = useSortableItem({
    id: app.id,
    isGhostMover,
    dragDelta,
  });

  return (
    <div
      ref={setNodeRef}
      data-launcher-id={app.id}
      style={style}
      className={`relative ${className}`}
    >
      <LauncherItemBadges
        isFolderTarget={isFolderTarget}
        isSelected={isSelected}
      />
      <Item
        variant="outline"
        {...dragProps}
        className={cn(
          'p-0',
          launcherItemStateClasses({
            isFolderTarget,
            isDwellTarget,
            isSelected,
          }),
          isFolderTarget && 'scale-[1.02]'
        )}
        onClick={(event) => onItemClick(app, event)}
        onKeyDown={(event) => {
          if (event.defaultPrevented || event.target !== event.currentTarget)
            return;
          if (event.key !== 'Enter') return;
          event.preventDefault();
          onActivate(app);
        }}
      >
        <div className="flex w-full items-center gap-3 px-3 py-2.5">
          <ScriptItemContent app={app} />
          <ItemActionButtons
            editTitle={`Edit ${app.title}`}
            onEdit={() => onEdit(app)}
            deleteTitle={`Delete ${app.title}`}
            onDelete={() => onRequestDelete(app)}
          />
        </div>
      </Item>
    </div>
  );
}
