import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { isLauncherFolder } from '@overline-zebar/config';
import type { LauncherItem } from '@overline-zebar/config';
import { LauncherRow } from '@/components/launcherItem';
import type {
  ItemHandlers,
  LauncherItemInteraction,
  LauncherListState,
} from '@/components/launcherItem';
import type { useLauncherDnd } from '@/components/dnd';
import type { useLauncherSelection } from '@/components/selection';
import type { useLauncherNavigation } from './useLauncherNavigation';

/** Bundles list state, per-item interaction flags and recursive row rendering. */
export function useLauncherListState({
  nav,
  selection,
  dnd,
  handlers,
  showCommand,
  collapsePath,
}: {
  nav: ReturnType<typeof useLauncherNavigation>;
  selection: ReturnType<typeof useLauncherSelection>;
  dnd: ReturnType<typeof useLauncherDnd>;
  handlers: ItemHandlers;
  showCommand?: boolean;
  collapsePath?: boolean;
}) {
  const { selectedIds } = selection;
  const {
    isSearching,
    folderOptions,
    folderChildren,
    folderCounts,
    enterTargetId,
    expandedFolderIds,
    toggleFolderExpanded,
  } = nav;

  const list: LauncherListState = {
    folders: folderOptions,
    selectedIds,
    handlers,
    dragEnabled: !isSearching,
    dragDelta: dnd.dragDelta,
    showCommand,
    collapsePath,
  };

  const interactionFor = (entry: LauncherItem): LauncherItemInteraction => ({
    isSelected: selectedIds.includes(entry.id),
    isDwellTarget: dnd.dwellTargetId === entry.id,
    isFolderTarget: dnd.folderTargetId === entry.id,
    isEnterTarget: entry.id === enterTargetId,
    isGhostMover: dnd.isGhostMover(entry.id),
  });

  const renderRow = (rowItem: LauncherItem) => {
    const isFolder = isLauncherFolder(rowItem);
    const children = isFolder && !isSearching ? folderChildren(rowItem.id) : [];

    return (
      <LauncherRow
        key={rowItem.id}
        item={rowItem}
        list={list}
        interaction={interactionFor(rowItem)}
        folderCount={isFolder ? folderCounts.get(rowItem.id) : undefined}
        canExpand={children.length > 0}
        isExpanded={expandedFolderIds.includes(rowItem.id)}
        onToggleExpanded={toggleFolderExpanded}
      >
        {children.length > 0 && (
          <SortableContext
            items={children.map((child) => child.id)}
            strategy={verticalListSortingStrategy}
          >
            {children.map((child) => renderRow(child))}
          </SortableContext>
        )}
      </LauncherRow>
    );
  };

  return { list, interactionFor, renderRow };
}
