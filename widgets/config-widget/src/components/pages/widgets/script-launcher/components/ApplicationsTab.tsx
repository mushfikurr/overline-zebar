import { Separator } from '@/components/common/Separator';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { UpdateFolderModal } from '@/components/UpdateFolderModal';
import { UpdateScriptModal } from '@/components/UpdateScriptModal';
import {
  isLauncherFolder,
  useWidgetSetting,
  type LauncherCommand,
  type LauncherFolder,
  type LauncherItem,
} from '@overline-zebar/config';
import { AppIcon, FolderSquare } from '@/components/icons';
import { cn } from '@/utils/cn';
import {
  DragStackOverlay,
  FolderTargetBadge,
  ROOT_DROP_ID,
  useLauncherApplications,
  useLauncherDnd,
} from '@overline-zebar/launcher';
import {
  Button,
  Card,
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileCode, FolderPlus, Pencil, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { ScriptItemContent } from './ScriptItemContent';

const ITEM_RING_CLASSES = {
  folderTarget: 'ring-primary/60 ring-[3px]',
  dwellTarget: 'ring-primary/40 ring-2',
};

function ScriptItem({
  app,
  isDwellTarget,
  isFolderTarget,
  onEdit,
  onRequestDelete,
}: {
  app: LauncherCommand;
  isDwellTarget: boolean;
  isFolderTarget: boolean;
  onEdit: (app: LauncherCommand) => void;
  onRequestDelete: (app: LauncherCommand) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id });

  return (
    <div
      ref={setNodeRef}
      data-launcher-id={app.id}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={`relative ${isDragging ? 'opacity-30' : ''}`}
    >
      {isFolderTarget && <FolderTargetBadge />}
      <Card
        {...attributes}
        {...listeners}
        className={cn(
          'cursor-pointer rounded-lg p-0 transition-colors hover:border-button-border hover:bg-surface/40',
          isFolderTarget
            ? ITEM_RING_CLASSES.folderTarget
            : isDwellTarget
              ? ITEM_RING_CLASSES.dwellTarget
              : ''
        )}
        onClick={() => onEdit(app)}
      >
        <div className="flex items-center gap-3 px-3 py-2.5">
          <ScriptItemContent app={app} />
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              title={`Edit ${app.title}`}
              aria-label={`Edit ${app.title}`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(app);
              }}
            >
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title={`Delete ${app.title}`}
              aria-label={`Delete ${app.title}`}
              className="hover:bg-danger/15 hover:text-danger"
              onClick={(e) => {
                e.stopPropagation();
                onRequestDelete(app);
              }}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function FolderItem({
  folder,
  count,
  isDwellTarget,
  isFolderTarget,
  onRename,
  onRequestDelete,
  children,
}: {
  folder: LauncherFolder;
  count: number;
  isDwellTarget: boolean;
  isFolderTarget: boolean;
  onRename: (folder: LauncherFolder) => void;
  onRequestDelete: (folder: LauncherFolder) => void;
  children?: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={`space-y-2 ${isDragging ? 'opacity-30' : ''}`}
    >
      {/* The folder card carries the launcher id (not the wrapper), so
       * dwell hit-testing targets the card and not its children. */}
      <div data-launcher-id={folder.id} className="relative">
        {isFolderTarget && <FolderTargetBadge />}
        <Card
          {...attributes}
          {...listeners}
          className={cn(
            'cursor-pointer rounded-lg p-0 transition-colors hover:border-button-border hover:bg-surface/40',
            isFolderTarget
              ? ITEM_RING_CLASSES.folderTarget
              : isDwellTarget
                ? ITEM_RING_CLASSES.dwellTarget
                : ''
          )}
          onClick={() => onRename(folder)}
        >
          <div className="flex items-center gap-3 px-3 py-2.5">
            <FolderSquare className="size-9" glyphClassName="size-5" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="truncate text-sm font-medium leading-none">
                {folder.title}
              </span>
              <span className="text-text-muted text-xs leading-none">
                Folder · {count} {count === 1 ? 'script' : 'scripts'}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                title={`Rename ${folder.title}`}
                aria-label={`Rename ${folder.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(folder);
                }}
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title={`Delete ${folder.title}`}
                aria-label={`Delete ${folder.title}`}
                className="hover:bg-danger/15 hover:text-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestDelete(folder);
                }}
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        </Card>
      </div>
      {count > 0 && (
        <div className="border-border/60 space-y-2 pl-6">{children}</div>
      )}
    </div>
  );
}

function ItemPreview({ item, width }: { item: LauncherItem; width?: number }) {
  const isFolder = isLauncherFolder(item);

  return (
    <div
      style={width !== undefined ? { width } : undefined}
      className="bg-surface text-text flex min-w-0 items-center gap-3 rounded-lg border border-border/70 px-3 py-2.5 opacity-90 shadow-xl"
    >
      {isFolder ? (
        <FolderSquare className="size-9" glyphClassName="size-5" />
      ) : (
        <span className="border-border bg-background-deeper flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border">
          <AppIcon app={item} className="size-5" />
        </span>
      )}
      <span className="min-w-0 flex-1 truncate text-sm font-medium leading-none">
        {item.title}
      </span>
      {!isFolder && item.command && (
        <span className="text-text-muted min-w-0 max-w-[45%] truncate text-xs leading-none">
          {item.command}
        </span>
      )}
    </div>
  );
}

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
  const dnd = useLauncherDnd({ model });

  const items: LauncherItem[] = model.applications;
  const folderIds = new Set(
    items.filter(isLauncherFolder).map((folder) => folder.id)
  );
  const scriptCount = items.filter((item) => !isLauncherFolder(item)).length;

  // Scripts inside a folder, in their persisted order.
  const folderScripts = (folderId: string) =>
    items.filter(
      (item): item is LauncherCommand =>
        !isLauncherFolder(item) && item.parentId === folderId
    );

  // Top level of the tree: folders, loose scripts, and any scripts whose
  // parent folder no longer exists.
  const topLevel = items.filter(
    (item) =>
      isLauncherFolder(item) ||
      !item.parentId ||
      !folderIds.has(item.parentId)
  );

  // Dropping on the list heading lifts scripts back to the top level,
  // mirroring the launcher's folder header.
  const { setNodeRef: setRootDropRef, isOver: isOverRootDrop } = useDroppable({
    id: ROOT_DROP_ID,
  });

  const renderScript = (app: LauncherCommand) => (
    <ScriptItem
      key={app.id}
      app={app}
      isDwellTarget={dnd.dwellTargetId === app.id}
      isFolderTarget={dnd.folderTargetId === app.id}
      onEdit={model.openScriptModalForEdit}
      onRequestDelete={(appToDelete) =>
        model.requestDeleteScript(appToDelete.id)
      }
    />
  );

  const emptyState = (
    <div className="border-border/60 flex flex-col items-center gap-1.5 rounded-lg border border-dashed px-4 py-10 text-center">
      <FileCode className="text-text-muted size-8" strokeWidth={1.5} />
      <p className="text-sm font-medium">No scripts yet</p>
      <p className="text-text-muted max-w-xs text-pretty text-sm">
        Add .exe paths, AHK scripts, or any shell command you want one click
        away.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => model.openScriptModalForAdd()}
      >
        <Plus />
        Add your first script
      </Button>
    </div>
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
          <h3 className="text-sm font-medium">
            Your Scripts
            {items.length > 0 && (
              <span className="text-text-muted"> · {scriptCount}</span>
            )}
          </h3>
          {isOverRootDrop && (
            <span className="text-text-muted mr-2 shrink-0 text-[10px] leading-none">
              Release to move to top level
            </span>
          )}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={model.openFolderModalForAdd}
            >
              <FolderPlus />
              Add Folder
            </Button>
            <Button size="sm" onClick={() => model.openScriptModalForAdd()}>
              <Plus />
              Add Script
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          emptyState
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
              <div className="space-y-2">
                {topLevel.map((item) =>
                  isLauncherFolder(item) ? (
                    <FolderItem
                      key={item.id}
                      folder={item}
                      count={folderScripts(item.id).length}
                      isDwellTarget={dnd.dwellTargetId === item.id}
                      isFolderTarget={dnd.folderTargetId === item.id}
                      onRename={model.openFolderModalForRename}
                      onRequestDelete={(folder) =>
                        model.requestDeleteFolder(folder)
                      }
                    >
                      <SortableContext
                        items={folderScripts(item.id).map(
                          (child) => child.id
                        )}
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
                <DragStackOverlay count={null}>
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
      <ConfirmDialog
        open={model.pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) model.dismissDelete();
        }}
        title={
          model.pendingDelete?.kind === 'folder'
            ? 'Delete folder'
            : model.pendingDelete?.kind === 'scripts'
              ? 'Delete scripts'
              : 'Delete script'
        }
        description={
          model.pendingDelete?.kind === 'folder' ? (
            <>
              &ldquo;{model.pendingDelete.folder.title}&rdquo; will be removed.
              The scripts inside are kept and moved to the top level.
            </>
          ) : model.pendingDelete?.kind === 'scripts' ? (
            <>
              This will remove {model.pendingDelete.ids.length}{' '}
              {model.pendingDelete.ids.length === 1 ? 'script' : 'scripts'}{' '}
              from your launcher.
            </>
          ) : (
            <>
              This will remove &ldquo;
              {model.pendingDelete?.app.title || 'Untitled script'}&rdquo; from
              your launcher.
            </>
          )
        }
        confirmLabel="Delete"
        destructive
        onConfirm={model.confirmDelete}
      />
    </div>
  );
}
