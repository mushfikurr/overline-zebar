import { isLauncherFolder, useWidgetSetting } from '@overline-zebar/config';
import type { LauncherFolder, LauncherItem } from '@overline-zebar/config';
import { getFolderCounts } from './utils/transforms';
import { getFolderContents, groupScriptsByFolder } from './utils/queries';
import { LauncherDeleteDialog } from './components/LauncherDeleteDialog';
import { UpdateFolderModal } from './components/UpdateFolderModal';
import { UpdateScriptModal } from './components/UpdateScriptModal';
import { isFileDialogActive } from './utils/fileDialogGuard';
import {
  DragStackOverlay,
  LauncherSelectionToolbar,
  useLauncherApplications,
  useLauncherDnd,
  useLauncherSelection,
} from './index';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@overline-zebar/ui';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FilePlus2, FolderPlus, Plus, Settings, X } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import * as zebar from 'zebar';
import {
  LauncherEmptyState,
  LauncherFolderEmptyState,
  LauncherNoResults,
} from './components/EmptyStates';
import { FolderHeader } from './components/FolderHeader';
import { LauncherDragPreview } from './components/LauncherDragPreview';
import { LauncherRow } from './components/LauncherRow';
import { LauncherTile } from './components/LauncherTile';
import type {
  ItemHandlers,
  LauncherItemInteraction,
  LauncherListState,
} from './components/types';
import { useRovingFocus } from './hooks/useRovingFocus';
import { launch } from './utils/launch';

const providers = zebar.createProviderGroup({
  glazewm: { type: 'glazewm' },
});

function App() {
  const [output, setOutput] = useState(providers.outputMap);
  const model = useLauncherApplications();
  const { applications } = model;
  const [view] = useWidgetSetting('script-launcher', 'view');
  const [showCommands] = useWidgetSetting('script-launcher', 'showCommands');
  const [collapsePaths] = useWidgetSetting('script-launcher', 'collapsePaths');
  const [query, setQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

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

  const visibleItems = useMemo(() => {
    if (isSearching) {
      return applications.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (!isLauncherFolder(item) && item.command.toLowerCase().includes(q))
      );
    }
    return getFolderContents(applications, currentFolderId);
  }, [applications, q, isSearching, currentFolderId]);

  const {
    selectedIds,
    clearSelection,
    handleSelectClick,
    handleBackgroundClick,
  } = useLauncherSelection({ model, orderedItems: visibleItems });

  const dnd = useLauncherDnd({
    model,
    selection: { selectedIds, clearSelection },
    springLoadEnabled: !isSearching && currentFolderId === null,
  });

  const { handleGridKeyDown, handleListKeyDown } = useRovingFocus();

  useEffect(() => {
    providers.onOutput(() => setOutput(providers.outputMap));

    zebar.currentWidget().tauriWindow.listen('tauri://blur', () => {
      if (isFileDialogActive()) return;
      zebar.currentWidget().close();
    });
  }, []);

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
    model.openScriptModalForAdd(
      !isSearching && currentFolderId ? currentFolderId : undefined
    );
  };

  const handleOpenFolder = (folderId: string) => {
    clearSelection();
    setQuery('');
    setCurrentFolderId(folderId);
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

  const folderOptions = useMemo(
    () =>
      applications.filter((item): item is LauncherFolder =>
        isLauncherFolder(item)
      ),
    [applications]
  );

  const childrenByFolder = useMemo(
    () => groupScriptsByFolder(applications),
    [applications]
  );

  const folderChildren = useCallback(
    (folderId: string) => childrenByFolder.get(folderId) ?? [],
    [childrenByFolder]
  );

  const enterTargetId = isSearching ? (visibleItems[0]?.id ?? null) : null;

  const handleItemClick = (item: LauncherItem, event: ReactMouseEvent) => {
    if (handleSelectClick(item, event)) return;

    if (isLauncherFolder(item)) {
      handleOpenFolder(item.id);
      return;
    }

    clearSelection();
    launch(item, output.glazewm);
  };

  const handlers: ItemHandlers = {
    onOpenFolder: (folder) => handleOpenFolder(folder.id),
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

  const list: LauncherListState = {
    folders: folderOptions,
    selectedIds,
    handlers,
    dragEnabled: !isSearching,
    dragDelta: dnd.dragDelta,
    showCommand: showCommands,
    collapsePath: collapsePaths,
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
                        handleOpenFolder(first.id);
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
            {applications.length === 0 && <LauncherEmptyState />}
            {applications.length > 0 &&
              visibleItems.length === 0 &&
              isSearching && <LauncherNoResults query={query} />}
            {applications.length > 0 &&
              visibleItems.length === 0 &&
              !isSearching &&
              currentFolder && <LauncherFolderEmptyState />}
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
                      list={list}
                      interaction={interactionFor(item)}
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
                <LauncherDragPreview
                  item={dnd.activeItem}
                  view={view}
                  width={dnd.activeRect?.width}
                  showCommand={
                    showCommands === true && !isLauncherFolder(dnd.activeItem)
                  }
                  collapsePath={collapsePaths === true}
                />
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
          <LauncherSelectionToolbar
            selectedIds={selectedIds}
            onMoveOut={
              currentFolderId && !isSearching
                ? handleMoveSelectedOut
                : undefined
            }
            onDelete={model.requestDeleteItems}
            onClear={clearSelection}
            className="mr-auto"
          />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(triggerProps: ComponentProps<typeof Button>) => (
                <Button
                  {...triggerProps}
                  size="icon"
                  title="Add"
                  aria-label="Add"
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
          >
            <Settings className="h-5 w-5" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
