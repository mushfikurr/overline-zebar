import { isLauncherFolder, type LauncherItem } from '@overline-zebar/config';
import { useSortableItem } from '../hooks/useSortableItem';
import { LauncherItemBadges } from './common/LauncherItemBadges';
import { ITEM_STATE_CLASSES } from './common/state-classes';
import {
  ContextMenu,
  ContextMenuTrigger,
  itemVariants,
} from '@overline-zebar/ui';
import { FolderSquare, IconSquare } from './icons';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { LauncherContextMenu } from './LauncherContextMenu';
import { cn } from '../utils/cn';
import type { LauncherItemInteraction, LauncherListState } from './types';

export function LauncherTile({
  item,
  list,
  interaction,
}: {
  item: LauncherItem;
  list: LauncherListState;
  interaction: LauncherItemInteraction;
}) {
  const { folders, selectedIds, handlers, dragEnabled, dragDelta } = list;
  const {
    isSelected,
    isDwellTarget,
    isFolderTarget,
    isEnterTarget,
    isGhostMover,
  } = interaction;
  const isFolder = isLauncherFolder(item);
  const [menuOpen, setMenuOpen] = useState(false);
  const { dragProps, setNodeRef, style, className } = useSortableItem({
    id: item.id,
    disabled: !dragEnabled,
    isGhostMover,
    dragDelta,
  });

  return (
    <ContextMenu
      onOpenChange={(open) => {
        setMenuOpen(open);
        if (open && selectedIds.length > 0 && !selectedIds.includes(item.id))
          handlers.onClearSelection();
      }}
    >
      <div
        ref={setNodeRef}
        data-launcher-id={item.id}
        style={style}
        className={cn('relative', className)}
      >
        <LauncherItemBadges
          isFolderTarget={isFolderTarget}
          isSelected={isSelected}
        />
        <ContextMenuTrigger
          render={(triggerProps: ComponentProps<'button'>) => (
            <button
              {...triggerProps}
              {...dragProps}
              type="button"
              data-launcher-item
              aria-pressed={isSelected}
              onClick={(event) => handlers.onItemClick(item, event)}
              className={cn(
                itemVariants(),
                'flex-nowrap text-text-muted hover:text-text active:scale-[0.96] h-[4.75rem] w-full min-w-0 flex-col justify-center gap-2 p-1.5 hover:bg-button/60',
                menuOpen && 'bg-button/60 text-text',
                isFolderTarget
                  ? `${ITEM_STATE_CLASSES.folderTarget} scale-105 text-text`
                  : isDwellTarget
                    ? ITEM_STATE_CLASSES.dwellTarget
                    : isSelected
                      ? `${ITEM_STATE_CLASSES.selected} text-text`
                      : isEnterTarget
                        ? 'bg-button/40'
                        : ''
              )}
            >
              {isFolder ? (
                <FolderSquare className="size-9" glyphClassName="size-6" />
              ) : (
                <IconSquare
                  app={item}
                  className="size-9"
                  glyphClassName="size-7"
                />
              )}
              <span className="w-full truncate text-center text-xs">
                {item.title}
              </span>
            </button>
          )}
        />
      </div>
      <LauncherContextMenu
        item={item}
        folders={folders}
        selectedIds={selectedIds}
        handlers={handlers}
      />
    </ContextMenu>
  );
}
