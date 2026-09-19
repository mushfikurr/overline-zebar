import { Separator } from '@/components/common/Separator';
import { LauncherDeleteDialog } from '@/components/LauncherDeleteDialog';
import { UpdateFolderModal } from '@/components/UpdateFolderModal';
import { UpdateScriptModal } from '@/components/UpdateScriptModal';
import {
  isLauncherFolder,
  useWidgetSetting,
  type LauncherCommand,
  type LauncherItem,
} from '@overline-zebar/config';
import {
  getFolderContents,
  groupScriptsByFolder,
  DragStackOverlay,
  LauncherSelectionToolbar,
  ROOT_DROP_ID,
  useLauncherApplications,
  useLauncherDnd,
  useLauncherSelection,
} from '@overline-zebar/script-launcher';
import {
  Button,
  FieldDescription,
  FieldInput,
  FieldTitle,
  FormField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@overline-zebar/ui';
import { DndContext, DragOverlay, useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FileCode, FolderPlus, Plus } from 'lucide-react';
import {
  useCallback,
  useMemo,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { FolderItem } from './FolderItem';
import { ItemPreview } from './ItemPreview';
import { ScriptItem } from './ScriptItem';

export function ApplicationsTab() {
  const [view, setView] = useWidgetSetting('script-launcher', 'view');
  const [showCommands, setShowCommands] = useWidgetSetting(
    'script-launcher',
    'showCommands'
  );
  const [collapsePaths, setCollapsePaths] = useWidgetSetting(
    'script-launcher',
    'collapsePaths'
  );
  const model = useLauncherApplications();

  const items: LauncherItem[] = model.applications;
  const scriptCount = items.filter((item) => !isLauncherFolder(item)).length;

  const scriptsByFolder = useMemo(() => groupScriptsByFolder(items), [items]);

  const folderScripts = useCallback(
    (folderId: string) => scriptsByFolder.get(folderId) ?? [],
    [scriptsByFolder]
  );

  const topLevel = useMemo(() => getFolderContents(items, null), [items]);

  const orderedItems = useMemo(
    () =>
      topLevel.flatMap((item) =>
        isLauncherFolder(item) ? [item, ...folderScripts(item.id)] : [item]
      ),
    [topLevel, folderScripts]
  );

  const {
    selectedIds,
    clearSelection,
    handleSelectClick,
    handleBackgroundClick,
  } = useLauncherSelection({ model, orderedItems, escapeClears: true });

  const dnd = useLauncherDnd({
    model,
    selection: { selectedIds, clearSelection },
  });

  const handleItemClick = (item: LauncherItem, event: ReactMouseEvent) => {
    if (handleSelectClick(item, event)) return;
    handleItemActivate(item);
  };

  const handleItemActivate = (item: LauncherItem) => {
    clearSelection();
    if (isLauncherFolder(item)) model.openFolderModalForRename(item);
    else model.openScriptModalForEdit(item);
  };

  const handleMoveSelectedOut = (ids: string[]) => {
    model.moveScriptsToTopLevel(ids);
    clearSelection();
  };

  const selectedInFolder = items.some(
    (item) => item.parentId && selectedIds.includes(item.id)
  );

  const { setNodeRef: setRootDropRef, isOver: isOverRootDrop } = useDroppable({
    id: ROOT_DROP_ID,
  });

  const renderScript = (app: LauncherCommand) => (
    <ScriptItem
      key={app.id}
      app={app}
      isDwellTarget={dnd.dwellTargetId === app.id}
      isFolderTarget={dnd.folderTargetId === app.id}
      isSelected={selectedIds.includes(app.id)}
      isGhostMover={dnd.isGhostMover(app.id)}
      dragDelta={dnd.dragDelta}
      onItemClick={handleItemClick}
      onActivate={handleItemActivate}
      onEdit={model.openScriptModalForEdit}
      onRequestDelete={(appToDelete) =>
        model.requestDeleteScript(appToDelete.id)
      }
    />
  );

  return (
    <div className="space-y-8">
      <div>
        <FormField>
          <FieldTitle>Default view</FieldTitle>
          <FieldInput>
            <Select
              value={view ?? 'grid'}
              onValueChange={(value) => setView(value as 'grid' | 'list')}
            >
              <SelectTrigger className="w-28">
                <SelectValue>
                  {(value: string) => (value === 'list' ? 'List' : 'Grid')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
          </FieldInput>
          <FieldDescription>Layout the launcher opens with.</FieldDescription>
        </FormField>
        <Separator />
        <FormField switch>
          <FieldTitle>Show commands</FieldTitle>
          <FieldInput>
            <Switch checked={showCommands} onCheckedChange={setShowCommands} />
          </FieldInput>
          <FieldDescription>
            Show each entry's command in list view.
          </FieldDescription>
        </FormField>
        {showCommands && (
          <>
            <Separator />
            <FormField switch>
              <FieldTitle>Collapse paths</FieldTitle>
              <FieldInput>
                <Switch
                  checked={collapsePaths}
                  onCheckedChange={setCollapsePaths}
                />
              </FieldInput>
              <FieldDescription>
                When an entry is a path, show only its last segment instead of
                the full path, e.g. C:/tools/app.exe shows as app.exe. Other
                commands are unaffected.
              </FieldDescription>
            </FormField>
          </>
        )}
      </div>

      <section className="space-y-4">
        <div
          ref={setRootDropRef}
          className={`flex items-center justify-between gap-4 rounded-md transition-colors duration-150 ${
            isOverRootDrop ? 'bg-primary/15' : ''
          }`}
        >
          <FieldTitle>
            Your Scripts
            {items.length > 0 && (
              <span className="text-text-muted"> · {scriptCount}</span>
            )}
          </FieldTitle>
          {isOverRootDrop && (
            <span className="text-text-muted mr-2 shrink-0 text-xs leading-none">
              Release to move to top level
            </span>
          )}
          <div className="flex items-center gap-2">
            <LauncherSelectionToolbar
              selectedIds={selectedIds}
              onMoveOut={selectedInFolder ? handleMoveSelectedOut : undefined}
              onDelete={model.requestDeleteItems}
              onClear={clearSelection}
            />
            <Button variant="outline" onClick={model.openFolderModalForAdd}>
              <FolderPlus />
              Add folder
            </Button>
            <Button onClick={() => model.openScriptModalForAdd()}>
              <Plus />
              Add script
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyScripts onAdd={() => model.openScriptModalForAdd()} />
        ) : (
          <DndContext
            sensors={dnd.sensors}
            collisionDetection={dnd.collisionDetection}
            onDragStart={dnd.onDragStart}
            onDragMove={dnd.onDragMove}
            onDragEnd={dnd.onDragEnd}
            onDragCancel={dnd.onDragCancel}
          >
            <SortableContext
              items={topLevel.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2" onClick={handleBackgroundClick}>
                {topLevel.map((item) =>
                  isLauncherFolder(item) ? (
                    <FolderItem
                      key={item.id}
                      folder={item}
                      count={folderScripts(item.id).length}
                      isDwellTarget={dnd.dwellTargetId === item.id}
                      isFolderTarget={dnd.folderTargetId === item.id}
                      isSelected={selectedIds.includes(item.id)}
                      isGhostMover={dnd.isGhostMover(item.id)}
                      dragDelta={dnd.dragDelta}
                      onItemClick={handleItemClick}
                      onActivate={handleItemActivate}
                      onRename={model.openFolderModalForRename}
                      onRequestDelete={(folder) =>
                        model.requestDeleteFolder(folder)
                      }
                    >
                      <SortableContext
                        items={folderScripts(item.id).map((child) => child.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {folderScripts(item.id).map((child) =>
                          renderScript(child)
                        )}
                      </SortableContext>
                    </FolderItem>
                  ) : (
                    renderScript(item)
                  )
                )}
              </div>
            </SortableContext>
            <DragOverlay>
              {dnd.activeItem ? (
                <DragStackOverlay
                  count={
                    dnd.multiDragIds !== null ? dnd.multiDragIds.length : null
                  }
                >
                  <ItemPreview
                    item={dnd.activeItem}
                    width={dnd.activeRect?.width}
                  />
                </DragStackOverlay>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </section>

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
        onConfirm={() => {
          model.confirmDelete();
          clearSelection();
        }}
        onDismiss={model.dismissDelete}
      />
    </div>
  );
}

function EmptyScripts({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="border-border/60 flex flex-col items-center gap-1.5 rounded-lg border border-dashed px-4 py-10 text-center">
      <FileCode className="text-text-muted size-8" strokeWidth={1.5} />
      <p className="text-sm font-medium">No scripts yet</p>
      <p className="text-text-muted max-w-xs text-pretty text-sm">
        Add .exe paths, AHK scripts, or any shell command you want one click
        away.
      </p>
      <Button variant="outline" size="sm" className="mt-2" onClick={onAdd}>
        <Plus />
        Add your first script
      </Button>
    </div>
  );
}
