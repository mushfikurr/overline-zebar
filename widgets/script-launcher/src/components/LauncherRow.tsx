import {
  isLauncherFolder,
  type LauncherFolder,
  type LauncherItem,
} from '@overline-zebar/config';
import { collapseCommandPath } from '../utils/queries';
import {
  useSortableItem,
  type LauncherDragDelta,
} from '../hooks/useSortableItem';
import { launcherItemStateClasses } from './common/state-classes';
import { LauncherItemBadges } from './common/LauncherItemBadges';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ContextMenu,
  ContextMenuTrigger,
  itemVariants,
} from '@overline-zebar/ui';
import { FolderSquare, IconSquare } from '@overline-zebar/config-widget';
import { ChevronDown } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';
import { LauncherContextMenu } from './LauncherContextMenu';
import { cn } from '../utils/cn';
import type { ItemHandlers } from './types';

export function LauncherRow({
  item,
  folderCount,
  folders,
  showCommand,
  collapsePath,
  dragEnabled,
  isDwellTarget,
  isFolderTarget,
  isSelected,
  isEnterTarget,
  isGhostMover,
  dragDelta,
  selectedIds,
  handlers,
  canExpand,
  isExpanded,
  onToggleExpanded,
  children,
}: {
  item: LauncherItem;
  folderCount?: number;
  folders: LauncherFolder[];
  showCommand?: boolean;
  collapsePath?: boolean;
  dragEnabled: boolean;
  isDwellTarget: boolean;
  isFolderTarget: boolean;
  isSelected: boolean;
  isEnterTarget: boolean;
  isGhostMover: boolean;
  dragDelta: LauncherDragDelta;
  selectedIds: string[];
  handlers: ItemHandlers;
  canExpand?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: (folderId: string) => void;
  children?: ReactNode;
}) {
  const isFolder = isLauncherFolder(item);
  const [menuOpen, setMenuOpen] = useState(false);
  const { dragProps, setNodeRef, style, className } = useSortableItem({
    id: item.id,
    disabled: !dragEnabled,
    isGhostMover,
    dragDelta,
  });
  const command =
    !isFolder && collapsePath
      ? collapseCommandPath(item.command)
      : isFolder
        ? undefined
        : item.command;

  const stateClasses = launcherItemStateClasses({
    isFolderTarget,
    isDwellTarget,
    isSelected,
  });

  const rowButton = (rowClassName: string) => (
    <ContextMenuTrigger
      render={(triggerProps: ComponentProps<'button'>) => (
        <button
          {...triggerProps}
          {...dragProps}
          type="button"
          data-launcher-item
          aria-pressed={isSelected}
          onClick={(event) => handlers.onItemClick(item, event)}
          className={rowClassName}
        >
          {isFolder ? (
            <FolderSquare className="size-6" glyphClassName="size-4" />
          ) : (
            <IconSquare app={item} className="size-6" glyphClassName="size-4" />
          )}
          <span className="min-w-0 flex-1 truncate text-sm leading-none">
            {item.title}
          </span>
          {isFolder
            ? folderCount !== undefined && (
                <span className="text-text-muted shrink-0 translate-y-[1px] text-xs leading-none">
                  {folderCount} {folderCount === 1 ? 'script' : 'scripts'}
                </span>
              )
            : showCommand && (
                <span className="text-text-muted min-w-0 max-w-[45%] truncate text-xs leading-none translate-y-[1px]">
                  {command}
                </span>
              )}
        </button>
      )}
    />
  );

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
        {canExpand ? (
          <Collapsible
            open={isExpanded}
            onOpenChange={() => onToggleExpanded?.(item.id)}
          >
            <div
              className={cn(
                'hover:bg-button/60 active:bg-button active:scale-[0.98] flex w-full items-center rounded-md transition-[background-color,box-shadow,transform] duration-150 ease-out',
                menuOpen && 'bg-button/60',
                stateClasses
              )}
            >
              {rowButton(
                cn(
                  itemVariants(),
                  'flex-nowrap text-text min-w-0 flex-1 gap-2.5 py-1.5 pl-[9px] pr-1 text-left'
                )
              )}
              <CollapsibleTrigger
                render={(triggerProps: ComponentProps<'button'>) => (
                  <button
                    {...triggerProps}
                    type="button"
                    className={cn(
                      itemVariants(),
                      'flex-nowrap text-text-muted hover:text-text group mr-1 shrink-0 rounded-sm p-1'
                    )}
                    title={
                      isExpanded
                        ? `Collapse ${item.title}`
                        : `Expand ${item.title}`
                    }
                    aria-label={
                      isExpanded
                        ? `Collapse ${item.title}`
                        : `Expand ${item.title}`
                    }
                  >
                    <ChevronDown className="group-data-[panel-open]:rotate-180 size-4 transition-transform duration-200" />
                  </button>
                )}
              />
            </div>
            {children && (
              <CollapsibleContent>
                <div className="mt-0.5 ml-[21px] flex flex-col gap-0.5 pl-[13px]">
                  {children}
                </div>
              </CollapsibleContent>
            )}
          </Collapsible>
        ) : (
          rowButton(
            cn(
              itemVariants(),
              'flex-nowrap text-text hover:bg-button/60 active:bg-button active:scale-[0.98] w-full min-w-0 gap-2.5 py-1.5 pl-[9px] pr-2 text-left',
              menuOpen && 'bg-button/60',
              stateClasses,
              isEnterTarget && !stateClasses && !menuOpen && 'bg-button/40'
            )
          )
        )}
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
