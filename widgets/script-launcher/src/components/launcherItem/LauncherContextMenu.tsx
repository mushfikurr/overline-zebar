import type { LauncherFolder, LauncherItem } from '@overline-zebar/config';
import {
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@overline-zebar/ui';
import { isLauncherFolder } from '@overline-zebar/config';
import type { ItemHandlers } from './types';

export function LauncherContextMenu({
  item,
  folders,
  selectedIds,
  handlers,
}: {
  item: LauncherItem;
  folders: LauncherFolder[];
  selectedIds: string[];
  handlers: ItemHandlers;
}) {
  const isBulk = selectedIds.length > 1 && selectedIds.includes(item.id);

  const movableIds = isBulk ? selectedIds : [item.id];
  const targetFolders = !isLauncherFolder(item)
    ? folders.filter(
        (folder) =>
          !movableIds.includes(folder.id) &&
          (isBulk || folder.id !== item.parentId)
      )
    : [];
  const moveToFolderSubmenu =
    targetFolders.length > 0 ? (
      <ContextMenuSub>
        <ContextMenuSubTrigger>Move to folder</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          {targetFolders.map((folder) => (
            <ContextMenuItem
              key={folder.id}
              onClick={() => handlers.onMoveToFolder(movableIds, folder.id)}
            >
              {folder.title}
            </ContextMenuItem>
          ))}
        </ContextMenuSubContent>
      </ContextMenuSub>
    ) : null;

  if (isBulk) {
    return (
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuLabel className="max-w-56 truncate">
            {selectedIds.length} selected
          </ContextMenuLabel>
          {moveToFolderSubmenu}
          {item.parentId && (
            <ContextMenuItem
              onClick={() => handlers.onMoveSelectedOut(selectedIds)}
            >
              Move to top level
            </ContextMenuItem>
          )}
          <ContextMenuItem
            variant="destructive"
            onClick={() => handlers.onDeleteSelected(selectedIds)}
          >
            Delete {selectedIds.length} items
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    );
  }

  return (
    <ContextMenuContent>
      <ContextMenuGroup>
        <ContextMenuLabel className="max-w-56 truncate">
          {item.title}
        </ContextMenuLabel>
        {isLauncherFolder(item) ? (
          <>
            {handlers.onOpenFolder && (
              <ContextMenuItem onClick={() => handlers.onOpenFolder?.(item)}>
                Open
              </ContextMenuItem>
            )}
            <ContextMenuItem onClick={() => handlers.onRenameFolder(item)}>
              Rename
            </ContextMenuItem>
            <ContextMenuItem
              variant="destructive"
              onClick={() => handlers.onDeleteFolder(item)}
            >
              Delete
            </ContextMenuItem>
          </>
        ) : (
          <>
            <ContextMenuItem onClick={() => handlers.onEditScript(item)}>
              Edit
            </ContextMenuItem>
            {moveToFolderSubmenu}
            {item.parentId && (
              <ContextMenuItem
                onClick={() => handlers.onMoveToTopLevel(item.id)}
              >
                Move to top level
              </ContextMenuItem>
            )}
            <ContextMenuItem
              variant="destructive"
              onClick={() => handlers.onDelete(item.id)}
            >
              Delete
            </ContextMenuItem>
          </>
        )}
      </ContextMenuGroup>
    </ContextMenuContent>
  );
}
