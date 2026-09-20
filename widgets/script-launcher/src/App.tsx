import { isLauncherFolder, useWidgetSetting } from '@overline-zebar/config';
import type { LauncherItem } from '@overline-zebar/config';
import { useLauncherApplications } from './hooks/useLauncherApplications';
import {
  LauncherDeleteDialog,
  UpdateFolderModal,
  UpdateScriptModal,
} from './components/modals';
import { LauncherDragOverlayContent, useLauncherDnd } from './components/dnd';
import {
  LauncherSelectionToolbar,
  useLauncherSelection,
} from './components/selection';
import { Button } from '@overline-zebar/ui';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { Settings } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import * as zebar from 'zebar';
import { LauncherAddMenu } from './components/addMenu';
import { FolderHeader } from './components/folder';
import {
  LauncherGridView,
  LauncherItemsEmptyState,
  LauncherListView,
} from './components/launcherItem';
import type { ItemHandlers } from './components/launcherItem';
import { LauncherSearchBar } from './components/searchBar';
import { useLauncherListState } from './hooks/useLauncherListState';
import { useLauncherNavigation } from './hooks/useLauncherNavigation';
import { useLauncherShortcuts } from './hooks/useLauncherShortcuts';
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

  const nav = useLauncherNavigation(applications);
  const {
    query,
    setQuery,
    isSearching,
    currentFolderId,
    setCurrentFolderId,
    currentFolder,
    visibleItems,
    openFolder,
  } = nav;

  const selection = useLauncherSelection({ model, orderedItems: visibleItems });
  const { selectedIds, clearSelection, handleSelectClick, handleBackgroundClick } =
    selection;

  const dnd = useLauncherDnd({
    model,
    selection: { selectedIds, clearSelection },
    springLoadEnabled: !isSearching && currentFolderId === null,
  });

  const { handleGridKeyDown, handleListKeyDown } = useRovingFocus();

  useEffect(() => {
    providers.onOutput(() => setOutput(providers.outputMap));
  }, []);

  const handleClearQuery = useCallback(() => setQuery(''), [setQuery]);

  const handleOpenFolder = useCallback(
    (folderId: string) => {
      clearSelection();
      openFolder(folderId);
    },
    [clearSelection, openFolder]
  );

  const handleFolderBack = useCallback(() => {
    clearSelection();
    setCurrentFolderId(null);
  }, [clearSelection, setCurrentFolderId]);

  useLauncherShortcuts({
    hasSelection: selectedIds.length > 0,
    onClearSelection: clearSelection,
    query,
    onClearQuery: handleClearQuery,
    currentFolderId,
    onExitFolder: handleFolderBack,
  });

  const handleOnSettingsClick = () => {
    zebar.startWidgetPreset('config-widget', 'default');
  };

  const handleOpenModalForAdd = () => {
    model.openScriptModalForAdd(
      !isSearching && currentFolderId ? currentFolderId : undefined
    );
  };

  const handleSearchSubmit = () => {
    const first = visibleItems[0];
    if (!first) return;

    if (isLauncherFolder(first)) {
      handleOpenFolder(first.id);
      return;
    }

    clearSelection();
    launch(first, output.glazewm);
  };

  const handleConfirmDelete = () => {
    model.confirmDelete();
    clearSelection();
  };

  const handleMoveSelectedOut = (ids: string[]) => {
    model.moveScriptsToTopLevel(ids);
    clearSelection();
  };

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

  const { list, interactionFor, renderRow } = useLauncherListState({
    nav,
    selection,
    dnd,
    handlers,
    showCommand: showCommands,
    collapsePath: collapsePaths,
  });

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
        {currentFolder && !isSearching && (
          <FolderHeader
            title={currentFolder.title}
            onBack={handleFolderBack}
          />
        )}
        <LauncherSearchBar
          hasApplications={applications.length > 0}
          query={query}
          resultCount={visibleItems.length}
          isSearching={isSearching}
          onQueryChange={setQuery}
          onSubmit={handleSearchSubmit}
        />

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
            <LauncherItemsEmptyState
              hasApplications={applications.length > 0}
              hasVisibleItems={visibleItems.length > 0}
              isSearching={isSearching}
              query={query}
              inFolder={currentFolder !== undefined}
            />
            {view === 'list' ? (
              <LauncherListView
                items={visibleItems}
                renderRow={renderRow}
                onKeyDown={handleListKeyDown}
              />
            ) : (
              <LauncherGridView
                items={visibleItems}
                list={list}
                interactionFor={interactionFor}
                onKeyDown={handleGridKeyDown}
              />
            )}
          </div>

          <DragOverlay>
            <LauncherDragOverlayContent
              dnd={dnd}
              view={view}
              showCommand={showCommands === true}
              collapsePath={collapsePaths === true}
            />
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
          <LauncherAddMenu
            onAddScript={handleOpenModalForAdd}
            onAddFolder={model.openFolderModalForAdd}
            canAddFolder={!currentFolderId}
          />
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
