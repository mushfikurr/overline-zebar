import type { LauncherFolder, LauncherItem } from '@overline-zebar/config';
import {
  LauncherContextMenu,
  LauncherItemBadges,
  launcherItemStateClasses,
  useSortableItem,
  type ItemHandlers,
  type LauncherDragDelta,
} from '@overline-zebar/script-launcher';
import { ContextMenu, ContextMenuTrigger, Item } from '@overline-zebar/ui';
import { FolderSquare } from '@/components/icons';
import { cn } from '@/utils/cn';
import {
  useState,
  type ComponentProps,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { ItemActionButtons } from './ItemActionButtons';

export function FolderItem({
  folder,
  folders,
  selectedIds,
  handlers,
  count,
  isDwellTarget,
  isFolderTarget,
  isSelected,
  isGhostMover,
  dragDelta,
  onItemClick,
  onActivate,
  onRename,
  onRequestDelete,
  children,
}: {
  folder: LauncherFolder;
  folders: LauncherFolder[];
  selectedIds: string[];
  handlers: ItemHandlers;
  count: number;
  isDwellTarget: boolean;
  isFolderTarget: boolean;
  isSelected: boolean;
  isGhostMover: boolean;
  dragDelta: LauncherDragDelta;
  onItemClick: (item: LauncherItem, event: ReactMouseEvent) => void;
  onActivate: (item: LauncherItem) => void;
  onRename: (folder: LauncherFolder) => void;
  onRequestDelete: (folder: LauncherFolder) => void;
  children?: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { dragProps, setNodeRef, style, className } = useSortableItem({
    id: folder.id,
    isGhostMover,
    dragDelta,
  });

  return (
    <ContextMenu
      onOpenChange={(open) => {
        setMenuOpen(open);
        if (open && selectedIds.length > 0 && !selectedIds.includes(folder.id))
          handlers.onClearSelection();
      }}
    >
      <div
        ref={setNodeRef}
        style={style}
        className={cn('space-y-2', isGhostMover && 'relative', className)}
      >
        <div data-launcher-id={folder.id} className="relative">
          <LauncherItemBadges
            isFolderTarget={isFolderTarget}
            isSelected={isSelected}
          />
          <ContextMenuTrigger
            render={(triggerProps: ComponentProps<typeof Item>) => (
              <Item
                {...triggerProps}
                variant="outline"
                {...dragProps}
                className={cn(
                  'p-0',
                  launcherItemStateClasses({
                    isFolderTarget,
                    isDwellTarget,
                    isSelected,
                  }),
                  isFolderTarget && 'scale-[1.02]',
                  menuOpen && 'bg-surface/40'
                )}
                onClick={(event) => onItemClick(folder, event)}
                onKeyDown={(event) => {
                  if (
                    event.defaultPrevented ||
                    event.target !== event.currentTarget
                  )
                    return;
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  onActivate(folder);
                }}
              >
                <div className="flex w-full items-center gap-3 px-3 py-2.5">
                  <FolderSquare className="size-9" glyphClassName="size-5" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="truncate text-sm font-medium leading-none">
                      {folder.title}
                    </span>
                    <span className="text-text-muted text-xs leading-none">
                      Folder · {count} {count === 1 ? 'script' : 'scripts'}
                    </span>
                  </div>
                  <ItemActionButtons
                    editTitle={`Rename ${folder.title}`}
                    onEdit={() => onRename(folder)}
                    deleteTitle={`Delete ${folder.title}`}
                    onDelete={() => onRequestDelete(folder)}
                  />
                </div>
              </Item>
            )}
          />
        </div>
        {count > 0 && (
          <div className="ml-[30px] border-l border-border/50 pl-2 [&>*]:py-1">
            {children}
          </div>
        )}
      </div>
      <LauncherContextMenu
        item={folder}
        folders={folders}
        selectedIds={selectedIds}
        handlers={handlers}
      />
    </ContextMenu>
  );
}
