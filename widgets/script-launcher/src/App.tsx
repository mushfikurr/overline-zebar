import {
  getFolderCounts,
  isLauncherFolder,
  useWidgetSetting,
} from '@overline-zebar/config';
import type {
  LauncherCommand,
  LauncherFolder,
  LauncherItem,
} from '@overline-zebar/config';
import {
  LauncherDeleteDialog,
  UpdateFolderModal,
  UpdateScriptModal,
} from '@overline-zebar/config-widget';
import {
  FolderSquare,
  IconSquare,
} from '@overline-zebar/config-widget/src/components/icons';
import { isFileDialogActive } from '@overline-zebar/config-widget/src/utils/fileDialogGuard';
import {
  DragStackOverlay,
  FolderTargetBadge,
  ITEM_STATE_CLASSES,
  PARENT_DROP_ID,
  SelectedBadge,
  useLauncherApplications,
  useLauncherDnd,
  useLauncherSelection,
} from '@overline-zebar/launcher';
import { logger } from '@overline-zebar/config/src/utils/logger';
import {
  Button,
  ButtonGroup,
  ButtonGroupText,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@overline-zebar/ui';
import { DndContext, DragOverlay, useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronDown,
  ChevronLeft,
  FileCode,
  FilePlus2,
  Folder,
  FolderOutput,
  FolderPlus,
  Plus,
  Settings,
  Trash2,
  X,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import * as zebar from 'zebar';

const providers = zebar.createProviderGroup({
  glazewm: { type: 'glazewm' },
});

/** Shared interaction tokens so tiles, rows, and footer buttons feel
 * identical: quick hover, tactile press. Under reduced motion the press
 * scale still applies, just without traveling. */
const interactive =
  'outline-none transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-out focus-visible:ring-[3px] focus-visible:ring-primary/50 motion-reduce:transition-[background-color,color,border-color,box-shadow]';

const ITEM_SELECTOR = '[data-launcher-item]';

type ItemHandlers = {
  onOpenFolder: (folder: LauncherFolder) => void;
  onEditScript: (script: LauncherCommand) => void;
  onDelete: (id: string) => void;
  onRenameFolder: (folder: LauncherFolder) => void;
  onDeleteFolder: (folder: LauncherFolder) => void;
  onMoveToTopLevel: (id: string) => void;
  onMoveToFolder: (ids: string[], folderId: string) => void;
  onItemClick: (item: LauncherItem, event: ReactMouseEvent) => void;
  onDeleteSelected: (ids: string[]) => void;
  onMoveSelectedOut: (ids: string[]) => void;
  onClearSelection: () => void;
};

function App() {
  const [output, setOutput] = useState(providers.outputMap);
  const model = useLauncherApplications();
  const { applications } = model;
  const [view] = useWidgetSetting('script-launcher', 'view');
  const [showCommands] = useWidgetSetting('script-launcher', 'showCommands');
  const [collapsePaths] = useWidgetSetting('script-launcher', 'collapsePaths');
  const [query, setQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Folders expanded inline with the chevron in list view.
  const [expandedFolderIds, setExpandedFolderIds] = useState<string[]>([]);

  const toggleFolderExpanded = useCallback((folderId: string) => {
    setExpandedFolderIds((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  }, []);

  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;

  // Search looks through every folder; otherwise the view shows the items
  // of the current folder (or the top level), in their persisted order.
  // Like the settings tab, the top level also claims orphans whose parent
  // folder no longer exists, so they never vanish from the launcher.
  const visibleItems = useMemo(() => {
    if (isSearching) {
      return applications.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (!isLauncherFolder(item) && item.command.toLowerCase().includes(q))
      );
    }
    return applications.filter((item) => {
      if ((item.parentId ?? null) === currentFolderId) return true;
      if (currentFolderId === null && item.parentId) {
        return !applications.some(
          (other) => isLauncherFolder(other) && other.id === item.parentId
        );
      }
      return false;
    });
  }, [applications, q, isSearching, currentFolderId]);

  // ----- Selection (ctrl/shift-click) ------------------------------------

  // Shared with the settings applications tab; folders select like
  // scripts. Stale-id pruning and Ctrl+A live in the hook.
  const {
    selectedIds,
    clearSelection,
    handleSelectClick,
    handleBackgroundClick,
  } = useLauncherSelection({ model, orderedItems: visibleItems });

  // ----- Drag & drop ------------------------------------------------------

  const dnd = useLauncherDnd({
    model,
    selection: { selectedIds, clearSelection },
    springLoadEnabled: !isSearching && currentFolderId === null,
  });

  useEffect(() => {
    providers.onOutput(() => setOutput(providers.outputMap));

    zebar.currentWidget().tauriWindow.listen('tauri://blur', () => {
      // Native file dialogs (e.g. the icon picker's upload dialog) steal
      // OS focus and fire blur; don't dismiss the launcher for those.
      if (isFileDialogActive()) return;
      zebar.currentWidget().close();
    });
  }, []);

  // Escape walks back out: selection first, then search, then the open
  // folder, then it closes the widget the same way a blur does.
  // Menus/modals handle their own Escape and stop it from reaching here,
  // so they close first; canceling a keyboard drag preventDefaults the
  // event, which lands here too and must not close the widget.
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;

      if (selectedIds.length > 0) {
        clearSelection();
        return;
      }

      if (query) {
        setQuery('');
        return;
      }

      if (currentFolderId) {
        setCurrentFolderId(null);
        return;
      }

      zebar.currentWidget().close();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [query, currentFolderId, selectedIds, clearSelection]);

  // A folder can disappear while open in the launcher (e.g. deleted from
  // the settings window); fall back to the top level instead of stranding
  // the view on a missing folder.
  useEffect(() => {
    if (
      currentFolderId &&
      !applications.some(
        (item) => isLauncherFolder(item) && item.id === currentFolderId
      )
    ) {
      setCurrentFolderId(null);
    }
  }, [applications, currentFolderId]);

  const handleOnSettingsClick = () => {
    zebar.startWidgetPreset('config-widget', 'default');
  };

  const handleOpenModalForAdd = () => {
    // Scripts added while a folder is open land inside it.
    model.openScriptModalForAdd(
      !isSearching && currentFolderId ? currentFolderId : undefined
    );
  };

  const handleOpenFolder = (folder: LauncherFolder) => {
    clearSelection();
    setQuery('');
    setCurrentFolderId(folder.id);
  };

  const handleConfirmDelete = () => {
    model.confirmDelete();
    clearSelection();
  };

  const handleMoveSelectedOut = (ids: string[]) => {
    model.moveScriptsToTopLevel(ids);
    clearSelection();
  };

  const currentFolder = useMemo(
    () =>
      currentFolderId
        ? applications.find(
            (item): item is LauncherFolder =>
              isLauncherFolder(item) && item.id === currentFolderId
          )
        : undefined,
    [applications, currentFolderId]
  );

  const folderCounts = useMemo(
    () => getFolderCounts(applications),
    [applications]
  );

  // Every folder, offered as a "Move to folder" target in the context
  // menu — the keyboard path for the pointer-only spring-load dwell.
  const folderOptions = useMemo(
    () =>
      applications.filter((item): item is LauncherFolder =>
        isLauncherFolder(item)
      ),
    [applications]
  );

  // A folder's direct children in their persisted order, rendered inline
  // when the folder is expanded with the chevron in list view.
  const childrenByFolder = useMemo(() => {
    const map = new Map<string, LauncherItem[]>();
    for (const item of applications) {
      const parent = item.parentId;
      if (!parent) continue;
      const list = map.get(parent);
      if (list) list.push(item);
      else map.set(parent, [item]);
    }
    return map;
  }, [applications]);

  const folderChildren = useCallback(
    (folderId: string) => childrenByFolder.get(folderId) ?? [],
    [childrenByFolder]
  );

  // While searching, Enter launches the first match — mark it so the
  // keyboard target is visible.
  const enterTargetId = isSearching ? (visibleItems[0]?.id ?? null) : null;

  // ----- Selection interactions -----------------------------------------

  const handleItemClick = (item: LauncherItem, event: ReactMouseEvent) => {
    // Ctrl/shift clicks select — folders included; plain clicks fall
    // through to the launcher's core interactions.
    if (handleSelectClick(item, event)) return;

    if (isLauncherFolder(item)) {
      handleOpenFolder(item);
      return;
    }

    // Plain click keeps the launcher's core interaction: launch (and
    // drop any selection that was in progress).
    clearSelection();
    launch(item, output.glazewm);
  };

  // ----- Focus navigation ----------------------------------------------

  const moveFocus = useCallback((event: KeyboardEvent, columns: number) => {
    // Arrow keys drive the keyboard drag while one is active (the sensor
    // preventDefaults them), so focus navigation must stand down.
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

  // Column count is derived from the rendered grid so arrow keys match the
  // actual layout at any widget width.
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

  const handlers: ItemHandlers = {
    onOpenFolder: handleOpenFolder,
    onEditScript: model.openScriptModalForEdit,
    onDelete: model.requestDeleteScript,
    onRenameFolder: model.openFolderModalForRename,
    onDeleteFolder: model.requestDeleteFolder,
    onMoveToTopLevel: (id) => handleMoveSelectedOut([id]),
    onMoveToFolder: (ids, folderId) => {
      model.moveScriptsIntoFolder(ids, folderId);
      clearSelection();
    },
    onItemClick: handleItemClick,
    onDeleteSelected: model.requestDeleteItems,
    onMoveSelectedOut: handleMoveSelectedOut,
    onClearSelection: clearSelection,
  };

  // A launcher row; folders also host their children inline when expanded
  // with the chevron (list view, not while searching).
  const renderRow = (rowItem: LauncherItem) => {
    const isFolder = isLauncherFolder(rowItem);
    const children = isFolder && !isSearching ? folderChildren(rowItem.id) : [];

    return (
      <LauncherRow
        key={rowItem.id}
        item={rowItem}
        folderCount={isFolder ? folderCounts.get(rowItem.id) : undefined}
        folders={folderOptions}
        showCommand={showCommands}
        collapsePath={collapsePaths}
        dragEnabled={!isSearching}
        isDwellTarget={dnd.dwellTargetId === rowItem.id}
        isFolderTarget={dnd.folderTargetId === rowItem.id}
        isSelected={selectedIds.includes(rowItem.id)}
        isEnterTarget={rowItem.id === enterTargetId}
        isGhostMover={dnd.isGhostMover(rowItem.id)}
        dragDelta={dnd.dragDelta}
        selectedIds={selectedIds}
        handlers={handlers}
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

  const emptyState = (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
      <FileCode className="text-text-muted size-8" strokeWidth={1.5} />
      <p className="text-wrap-balance text-sm font-medium">
        Scripts you add will show up here
      </p>
      <p className="text-text-muted max-w-xs text-pretty">
        These can be .exe paths, AHK scripts you commonly use, or generally just
        any shell command.
      </p>
    </div>
  );

  const noResults = (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
      <p className="text-wrap-balance text-sm font-medium">
        No scripts match “{query}”
      </p>
      <p className="text-text-muted">Try a different name or command.</p>
    </div>
  );

  const folderEmptyState = (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
      <Folder className="text-text-muted size-8" strokeWidth={1.5} />
      <p className="text-wrap-balance text-sm font-medium">
        Nothing in this folder yet
      </p>
      <p className="text-text-muted max-w-xs text-pretty">
        Add a script with the plus below, or drag one onto the folder.
      </p>
    </div>
  );

  return (
    <div className="text-text relative h-screen select-none overflow-hidden rounded-lg border border-button-border/80 bg-background shadow-sm backdrop-blur-xl antialiased">
      <UpdateScriptModal
        open={model.isScriptModalOpen}
        setOpen={model.setIsScriptModalOpen}
        newApp={model.newApp}
        setNewApp={model.setNewApp}
        editingId={model.editingId}
        onAddOrUpdate={model.commitScript}
      />
      <UpdateFolderModal
        open={model.isFolderModalOpen}
        setOpen={model.setIsFolderModalOpen}
        name={model.folderName}
        setName={model.setFolderName}
        editing={model.editingFolderId !== null}
        onSubmit={model.commitFolder}
      />
      <LauncherDeleteDialog
        pendingDelete={model.pendingDelete}
        onConfirm={handleConfirmDelete}
        onDismiss={model.dismissDelete}
      />
      <div className="flex h-full w-full flex-col">
        {applications.length > 0 && (
          <>
            {currentFolder && !isSearching && (
              <FolderHeader
                title={currentFolder.title}
                onBack={() => {
                  clearSelection();
                  setCurrentFolderId(null);
                }}
              />
            )}
            <div className="bg-surface flex shrink-0 items-center p-2 pb-0.5">
              <InputGroup>
                <InputGroupInput
                  className="px-2"
                  placeholder="Search scripts..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && visibleItems.length > 0) {
                      const first = visibleItems[0];
                      if (!first) return;
                      if (isLauncherFolder(first)) {
                        handleOpenFolder(first);
                      } else {
                        clearSelection();
                        launch(first, output.glazewm);
                      }
                    }
                  }}
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label="Clear search"
                      title="Clear (Esc)"
                      onClick={() => setQuery('')}
                    >
                      <X />
                    </InputGroupButton>
                  </InputGroupAddon>
                )}
              </InputGroup>
              {/* Stable live region so filtering and the no-results state
               * reach screen readers, not just the eye. */}
              <span role="status" className="sr-only">
                {isSearching
                  ? visibleItems.length > 0
                    ? `${visibleItems.length} ${visibleItems.length === 1 ? 'result' : 'results'}`
                    : `No scripts match ${query}`
                  : ''}
              </span>
            </div>
          </>
        )}

        <DndContext
          sensors={dnd.sensors}
          collisionDetection={dnd.collisionDetection}
          onDragStart={dnd.onDragStart}
          onDragMove={dnd.onDragMove}
          onDragEnd={dnd.onDragEnd}
          onDragCancel={dnd.onDragCancel}
        >
          <div
            className="bg-surface min-h-0 min-w-0 flex-1 overflow-y-auto"
            onClick={handleBackgroundClick}
          >
            {applications.length === 0 && emptyState}
            {applications.length > 0 &&
              visibleItems.length === 0 &&
              isSearching &&
              noResults}
            {applications.length > 0 &&
              visibleItems.length === 0 &&
              !isSearching &&
              currentFolder &&
              folderEmptyState}
            {visibleItems.length > 0 && view !== 'list' && (
              <SortableContext
                items={visibleItems.map((item) => item.id)}
                strategy={rectSortingStrategy}
              >
                <div
                  className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] content-start gap-1 p-2"
                  onKeyDown={handleGridKeyDown}
                >
                  {visibleItems.map((item) => (
                    <LauncherTile
                      key={item.id}
                      item={item}
                      folders={folderOptions}
                      dragEnabled={!isSearching}
                      isDwellTarget={dnd.dwellTargetId === item.id}
                      isFolderTarget={dnd.folderTargetId === item.id}
                      isSelected={selectedIds.includes(item.id)}
                      isEnterTarget={item.id === enterTargetId}
                      isGhostMover={dnd.isGhostMover(item.id)}
                      dragDelta={dnd.dragDelta}
                      selectedIds={selectedIds}
                      handlers={handlers}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
            {visibleItems.length > 0 && view === 'list' && (
              <SortableContext
                items={visibleItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className="flex flex-col gap-0.5 p-2"
                  onKeyDown={handleListKeyDown}
                >
                  {visibleItems.map((item) => renderRow(item))}
                </div>
              </SortableContext>
            )}
          </div>

          <DragOverlay>
            {dnd.activeItem ? (
              <DragStackOverlay
                count={
                  dnd.multiDragIds !== null ? dnd.multiDragIds.length : null
                }
              >
                {view === 'list' ? (
                  <RowPreview
                    item={dnd.activeItem}
                    width={dnd.activeRect?.width}
                    showCommand={
                      showCommands === true && !isLauncherFolder(dnd.activeItem)
                    }
                    collapsePath={collapsePaths === true}
                  />
                ) : (
                  <TilePreview
                    item={dnd.activeItem}
                    width={dnd.activeRect?.width}
                  />
                )}
              </DragStackOverlay>
            ) : null}
          </DragOverlay>
        </DndContext>

        <div
          className="bg-background text-text flex shrink-0 items-center justify-end gap-2 rounded-md rounded-t-none border-t border-border/60 p-2"
          style={{
            boxShadow:
              'inset 0 4px 10px -6px rgba(0,0,0,0.07), inset 0 14px 28px -14px rgba(0,0,0,0.16)',
          }}
        >
          {selectedIds.length > 0 && (
            <ButtonGroup className="animate-in fade-in slide-in-from-bottom-1 duration-150 motion-reduce:animate-none mr-auto h-7">
              <ButtonGroupText role="status" className="select-none">
                <span className="text-text font-semibold tabular-nums leading-none">
                  {selectedIds.length}
                </span>
                selected
              </ButtonGroupText>
              {currentFolderId && !isSearching && (
                <Button
                  variant="default"
                  size="icon"
                  title="Move to top level"
                  aria-label="Move selected to top level"
                  className={interactive}
                  onClick={() => handleMoveSelectedOut(selectedIds)}
                >
                  <FolderOutput />
                </Button>
              )}
              <Button
                variant="default"
                size="icon"
                title="Delete selected"
                aria-label="Delete selected"
                className={`${interactive} hover:bg-danger/15 hover:text-danger`}
                onClick={() => model.requestDeleteItems(selectedIds)}
              >
                <Trash2 />
              </Button>
              <Button
                variant="default"
                size="icon"
                title="Clear selection (Esc)"
                aria-label="Clear selection"
                className={interactive}
                onClick={clearSelection}
              >
                <X />
              </Button>
            </ButtonGroup>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(triggerProps: ComponentProps<typeof Button>) => (
                <Button
                  {...triggerProps}
                  size="icon"
                  title="Add"
                  aria-label="Add"
                  className={interactive}
                >
                  <Plus className="h-5 w-5" strokeWidth={2.5} />
                </Button>
              )}
            />
            <DropdownMenuContent side="top" align="end" sideOffset={6}>
              <DropdownMenuItem onClick={handleOpenModalForAdd}>
                <FilePlus2 />
                Add script
              </DropdownMenuItem>
              {!currentFolderId && (
                <DropdownMenuItem onClick={model.openFolderModalForAdd}>
                  <FolderPlus />
                  Add folder
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={handleOnSettingsClick}
            size="icon"
            title="Settings"
            aria-label="Settings"
            className={interactive}
          >
            <Settings className="h-5 w-5" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function FolderHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: PARENT_DROP_ID });

  return (
    <div
      ref={setNodeRef}
      className={`bg-surface flex shrink-0 items-center gap-1.5 rounded-md px-2 pt-3 pb-1.5 transition-colors duration-150 ${
        isOver ? 'bg-primary/15' : ''
      }`}
    >
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onBack}
        title="Back to all scripts"
        aria-label="Back to all scripts"
        className="text-text-muted hover:text-text"
      >
        <ChevronLeft className="size-4" strokeWidth={2.5} />
      </Button>
      <FolderSquare className="size-5" glyphClassName="size-3.5" />
      <span className="text-text-muted min-w-0 flex-1 truncate text-xs font-medium leading-none">
        {title}
      </span>
      {isOver && (
        <span className="text-text-muted shrink-0 text-xs leading-none">
          Release to move out
        </span>
      )}
    </div>
  );
}

function LauncherTile({
  item,
  folders,
  dragEnabled,
  isDwellTarget,
  isFolderTarget,
  isSelected,
  isEnterTarget,
  isGhostMover,
  dragDelta,
  selectedIds,
  handlers,
}: {
  item: LauncherItem;
  folders: LauncherFolder[];
  dragEnabled: boolean;
  isDwellTarget: boolean;
  isFolderTarget: boolean;
  isSelected: boolean;
  isEnterTarget: boolean;
  isGhostMover: boolean;
  dragDelta: { x: number; y: number } | null;
  selectedIds: string[];
  handlers: ItemHandlers;
}) {
  const isFolder = isLauncherFolder(item);
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !dragEnabled });
  const dragProps = dragEnabled ? { ...attributes, ...listeners } : {};

  return (
    <ContextMenu
      onOpenChange={(open) => {
        setMenuOpen(open);
        // Right-clicking past the selection starts a fresh single-item
        // context, like in Explorer.
        if (open && selectedIds.length > 0 && !selectedIds.includes(item.id))
          handlers.onClearSelection();
      }}
    >
      <div
        ref={setNodeRef}
        data-launcher-id={item.id}
        style={{
          transform:
            isGhostMover && dragDelta
              ? `translate3d(${dragDelta.x}px, ${dragDelta.y}px, 0)`
              : CSS.Translate.toString(transform),
          transition: isGhostMover ? 'none' : transition,
        }}
        className={`relative ${isDragging ? 'opacity-30' : ''} ${
          isGhostMover ? 'z-20' : ''
        }`}
      >
        {isFolderTarget ? (
          <FolderTargetBadge />
        ) : isSelected ? (
          <SelectedBadge />
        ) : null}
        <ContextMenuTrigger
          render={(triggerProps: ComponentProps<'button'>) => (
            <button
              {...triggerProps}
              {...dragProps}
              type="button"
              data-launcher-item
              aria-pressed={isSelected}
              onClick={(event) => handlers.onItemClick(item, event)}
              className={`${interactive} text-text-muted hover:text-text active:scale-[0.96] flex h-[4.75rem] w-full min-w-0 flex-col items-center justify-center gap-2 rounded-md p-1.5 hover:bg-button/60 ${
                menuOpen ? 'bg-button/60 text-text' : ''
              } ${
                isFolderTarget
                  ? `${ITEM_STATE_CLASSES.folderTarget} scale-105 text-text`
                  : isDwellTarget
                    ? ITEM_STATE_CLASSES.dwellTarget
                    : isSelected
                      ? `${ITEM_STATE_CLASSES.selected} text-text`
                      : isEnterTarget
                        ? 'bg-button/40'
                        : ''
              }`}
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

function LauncherRow({
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
  dragDelta: { x: number; y: number } | null;
  selectedIds: string[];
  handlers: ItemHandlers;
  canExpand?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: (folderId: string) => void;
  children?: ReactNode;
}) {
  const isFolder = isLauncherFolder(item);
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !dragEnabled });
  const dragProps = dragEnabled ? { ...attributes, ...listeners } : {};
  const command =
    !isFolder && collapsePath
      ? collapseCommandPath(item.command)
      : isFolder
        ? undefined
        : item.command;

  const stateClasses = isFolderTarget
    ? ITEM_STATE_CLASSES.folderTarget
    : isDwellTarget
      ? ITEM_STATE_CLASSES.dwellTarget
      : isSelected
        ? ITEM_STATE_CLASSES.selected
        : '';

  // With the chevron, a folder row becomes a flex pair: the row proper
  // (still opens the folder) plus the collapse trigger beside it. Hover
  // and state paint move to the wrapper so both feel like one row.
  const rowButton = (className: string) => (
    <ContextMenuTrigger
      render={(triggerProps: ComponentProps<'button'>) => (
        <button
          {...triggerProps}
          {...dragProps}
          type="button"
          data-launcher-item
          aria-pressed={isSelected}
          onClick={(event) => handlers.onItemClick(item, event)}
          className={className}
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
        // Right-clicking past the selection starts a fresh single-item
        // context, like in Explorer.
        if (open && selectedIds.length > 0 && !selectedIds.includes(item.id))
          handlers.onClearSelection();
      }}
    >
      <div
        ref={setNodeRef}
        data-launcher-id={item.id}
        style={{
          transform:
            isGhostMover && dragDelta
              ? `translate3d(${dragDelta.x}px, ${dragDelta.y}px, 0)`
              : CSS.Translate.toString(transform),
          transition: isGhostMover ? 'none' : transition,
        }}
        className={`relative ${isDragging ? 'opacity-30' : ''} ${
          isGhostMover ? 'z-20' : ''
        }`}
      >
        {isFolderTarget ? (
          <FolderTargetBadge />
        ) : isSelected ? (
          <SelectedBadge />
        ) : null}
        {canExpand ? (
          <Collapsible
            open={isExpanded}
            onOpenChange={() => onToggleExpanded?.(item.id)}
          >
            <div
              className={`hover:bg-button/60 active:bg-button active:scale-[0.98] flex w-full items-center rounded-md transition-[background-color,box-shadow,transform] duration-150 ease-out ${
                menuOpen ? 'bg-button/60' : ''
              } ${stateClasses}`}
            >
              {rowButton(
                `${interactive} text-text flex min-w-0 flex-1 items-center gap-2.5 py-1.5 pl-[9px] pr-1 text-left`
              )}
              <CollapsibleTrigger
                render={(triggerProps: ComponentProps<'button'>) => (
                  <button
                    {...triggerProps}
                    type="button"
                    className={`${interactive} text-text-muted hover:text-text group mr-1 flex shrink-0 items-center rounded-sm p-1`}
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
            `${interactive} text-text hover:bg-button/60 active:bg-button active:scale-[0.98] flex w-full min-w-0 items-center gap-2.5 rounded-md py-1.5 pl-[9px] pr-2 text-left ${
              menuOpen ? 'bg-button/60' : ''
            } ${stateClasses} ${
              isEnterTarget && !stateClasses && !menuOpen ? 'bg-button/40' : ''
            }`
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

function LauncherContextMenu({
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
  // Right-clicking a selected item with more selected acts on the whole
  // selection instead of just the item under the cursor — folders
  // included.
  const isBulk = selectedIds.length > 1 && selectedIds.includes(item.id);

  // The keyboard path for tucking items into folders: the spring-load
  // dwell only exists for the pointer. Folders already holding the item
  // (or part of the selection) are not offered as targets.
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
            <ContextMenuItem onClick={() => handlers.onOpenFolder(item)}>
              Open
            </ContextMenuItem>
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

function TilePreview({ item, width }: { item: LauncherItem; width?: number }) {
  const isFolder = isLauncherFolder(item);

  return (
    <div
      style={width !== undefined ? { width } : undefined}
      className="bg-surface text-text flex h-[4.75rem] min-w-0 flex-col items-center justify-center gap-2 rounded-md border border-border/70 p-1.5 opacity-90 shadow-xl"
    >
      {isFolder ? (
        <FolderSquare className="size-9" glyphClassName="size-6" />
      ) : (
        <IconSquare app={item} className="size-9" glyphClassName="size-7" />
      )}
      <span className="w-full truncate text-center text-xs">{item.title}</span>
    </div>
  );
}

function RowPreview({
  item,
  width,
  showCommand,
  collapsePath,
}: {
  item: LauncherItem;
  width?: number;
  showCommand?: boolean;
  collapsePath?: boolean;
}) {
  const isFolder = isLauncherFolder(item);
  const command =
    !isFolder && collapsePath
      ? collapseCommandPath(item.command)
      : isFolder
        ? undefined
        : item.command;

  return (
    <div
      style={width !== undefined ? { width } : undefined}
      className="bg-surface text-text flex min-w-0 items-center gap-2.5 rounded-md border border-border/70 py-1.5 pl-[9px] pr-2 text-left opacity-90 shadow-xl"
    >
      {isFolder ? (
        <FolderSquare className="size-6" glyphClassName="size-4" />
      ) : (
        <IconSquare app={item} className="size-6" glyphClassName="size-4" />
      )}
      <span className="min-w-0 flex-1 truncate text-sm leading-none">
        {item.title}
      </span>
      {!isFolder && showCommand && (
        <span className="text-text-muted min-w-0 max-w-[45%] truncate text-xs leading-none translate-y-[1px]">
          {command}
        </span>
      )}
    </div>
  );
}

function collapseCommandPath(command: string): string {
  const trimmed = command.trim();
  const segments = trimmed.split(/[\\/]+/);
  const last = segments[segments.length - 1];
  return last === undefined || last === '' ? trimmed : last;
}

async function launch(
  application: LauncherCommand,
  glazewm: zebar.GlazeWmOutput | null
) {
  if (!glazewm) return;
  logger.log('Launching command', application.command, application.args);
  await glazewm.runCommand(
    `shell-exec ${application.command} ${application.args.join(' ')}`
  );
}

export default App;
