import { Separator } from '@/components/common/Separator';
import { UpdateFolderModal } from '@/components/UpdateFolderModal';
import { UpdateScriptModal } from '@/components/UpdateScriptModal';
import {
  isLauncherFolder,
  useWidgetSetting,
  type LauncherCommand,
  type LauncherFolder,
  type LauncherItem,
} from '@overline-zebar/config';
import { FolderSquare } from '@/components/icons';
import { generateId } from '@overline-zebar/config/src/utils/generateId';
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
import { FileCode, FolderPlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { ScriptItemContent } from './ScriptItemContent';

const EMPTY_APP: LauncherCommand = {
  id: '',
  title: '',
  command: '',
  args: [],
  icon: undefined,
  iconPath: undefined,
  iconData: undefined,
};

function ScriptItem({
  app,
  onEdit,
  onDelete,
}: {
  app: LauncherCommand;
  onEdit: (app: LauncherCommand) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Disarm the two-step delete automatically so a stray first click
  // never lingers as armed.
  useEffect(() => {
    if (!confirmingDelete) return;
    const timer = setTimeout(() => setConfirmingDelete(false), 2500);
    return () => clearTimeout(timer);
  }, [confirmingDelete]);

  return (
    <Card
      className="cursor-pointer rounded-lg p-0 transition-colors hover:border-button-border hover:bg-surface/40"
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
            title={
              confirmingDelete ? 'Click again to delete' : `Delete ${app.title}`
            }
            aria-label={
              confirmingDelete
                ? `Confirm deleting ${app.title}`
                : `Delete ${app.title}`
            }
            className={
              confirmingDelete
                ? 'bg-danger/15 text-danger hover:bg-danger/25'
                : undefined
            }
            onBlur={() => setConfirmingDelete(false)}
            onClick={(e) => {
              e.stopPropagation();
              if (confirmingDelete) {
                setConfirmingDelete(false);
                onDelete(app.id);
              } else {
                setConfirmingDelete(true);
              }
            }}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function FolderItem({
  folder,
  count,
  onRename,
  onDelete,
  children,
}: {
  folder: LauncherFolder;
  count: number;
  onRename: (folder: LauncherFolder) => void;
  onDelete: (folder: LauncherFolder) => void;
  children?: ReactNode;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!confirmingDelete) return;
    const timer = setTimeout(() => setConfirmingDelete(false), 2500);
    return () => clearTimeout(timer);
  }, [confirmingDelete]);

  return (
    <div className="space-y-2">
      <Card
        className="cursor-pointer rounded-lg p-0 transition-colors hover:border-button-border hover:bg-surface/40"
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
              title={
                confirmingDelete
                  ? 'Click again to delete (scripts are kept)'
                  : `Delete ${folder.title}`
              }
              aria-label={
                confirmingDelete
                  ? `Confirm deleting ${folder.title}`
                  : `Delete ${folder.title}`
              }
              className={
                confirmingDelete
                  ? 'bg-danger/15 text-danger hover:bg-danger/25'
                  : undefined
              }
              onBlur={() => setConfirmingDelete(false)}
              onClick={(e) => {
                e.stopPropagation();
                if (confirmingDelete) {
                  setConfirmingDelete(false);
                  onDelete(folder);
                } else {
                  setConfirmingDelete(true);
                }
              }}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </Card>
      {count > 0 && (
        <div className="border-border/60 space-y-2 pl-6">{children}</div>
      )}
    </div>
  );
}

export function ApplicationsTab() {
  const [applications, setApplications] = useWidgetSetting(
    'script-launcher',
    'applications'
  );
  const [view, setView] = useWidgetSetting('script-launcher', 'view');
  const [showCommands, setShowCommands] = useWidgetSetting(
    'script-launcher',
    'showCommands'
  );
  const [collapsePaths, setCollapsePaths] = useWidgetSetting(
    'script-launcher',
    'collapsePaths'
  );
  const [newApp, setNewApp] = useState<LauncherCommand>({ ...EMPTY_APP });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');

  const items: LauncherItem[] = applications;
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

  const handleAddOrUpdate = () => {
    if (editingId) {
      setApplications(
        items.map((item) =>
          item.id === editingId && !isLauncherFolder(item)
            ? { ...newApp, args: newApp.args }
            : item
        )
      );
    } else {
      setApplications([
        ...items,
        { ...newApp, id: generateId(), args: newApp.args },
      ]);
    }
    setNewApp({ ...EMPTY_APP });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleOpenModalForEdit = (appToEdit: LauncherCommand) => {
    setEditingId(appToEdit.id);
    setNewApp({ ...appToEdit, args: appToEdit.args });
    setIsModalOpen(true);
  };

  const handleOpenModalForAdd = () => {
    setEditingId(null);
    setNewApp({ ...EMPTY_APP });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setApplications(items.filter((item) => item.id !== id));
  };

  const handleOpenFolderModalForAdd = () => {
    setEditingFolderId(null);
    setFolderName('');
    setIsFolderModalOpen(true);
  };

  const handleOpenFolderModalForRename = (folder: LauncherFolder) => {
    setEditingFolderId(folder.id);
    setFolderName(folder.title);
    setIsFolderModalOpen(true);
  };

  const handleAddOrUpdateFolder = () => {
    const title = folderName.trim();
    if (!title) return;

    if (editingFolderId) {
      setApplications(
        items.map((item) =>
          isLauncherFolder(item) && item.id === editingFolderId
            ? { ...item, title }
            : item
        )
      );
    } else {
      setApplications([...items, { id: generateId(), type: 'folder', title }]);
    }
    setFolderName('');
    setEditingFolderId(null);
    setIsFolderModalOpen(false);
  };

  // Deleting a folder keeps its scripts: they lift up to the top level,
  // taking the folder's slot in order.
  const handleDeleteFolder = (folder: LauncherFolder) => {
    const folderIndex = items.findIndex((item) => item.id === folder.id);
    if (folderIndex === -1) return;

    const next = items.filter((item) => item.id !== folder.id);
    const children = folderScripts(folder.id).map((child) => ({
      ...child,
      parentId: undefined,
    }));
    next.splice(folderIndex, 0, ...children);
    setApplications(next);
  };

  const renderScript = (app: LauncherCommand) => (
    <ScriptItem
      key={app.id}
      app={app}
      onEdit={handleOpenModalForEdit}
      onDelete={handleDelete}
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
        onClick={handleOpenModalForAdd}
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
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-medium">
            Your Scripts
            {items.length > 0 && (
              <span className="text-text-muted"> · {scriptCount}</span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenFolderModalForAdd}
            >
              <FolderPlus />
              Add Folder
            </Button>
            <Button size="sm" onClick={handleOpenModalForAdd}>
              <Plus />
              Add Script
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          emptyState
        ) : (
          <div className="space-y-2">
            {items
              .filter(
                (item) =>
                  isLauncherFolder(item) ||
                  !item.parentId ||
                  !folderIds.has(item.parentId)
              )
              .map((item) =>
                isLauncherFolder(item) ? (
                  <FolderItem
                    key={item.id}
                    folder={item}
                    count={folderScripts(item.id).length}
                    onRename={handleOpenFolderModalForRename}
                    onDelete={handleDeleteFolder}
                  >
                    {folderScripts(item.id).map((child) => renderScript(child))}
                  </FolderItem>
                ) : (
                  renderScript(item)
                )
              )}
          </div>
        )}
      </section>

      <UpdateScriptModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        newApp={newApp}
        setNewApp={setNewApp}
        editingId={editingId}
        onAddOrUpdate={handleAddOrUpdate}
      />
      <UpdateFolderModal
        open={isFolderModalOpen}
        setOpen={setIsFolderModalOpen}
        name={folderName}
        setName={setFolderName}
        editing={editingFolderId !== null}
        onSubmit={handleAddOrUpdateFolder}
      />
    </div>
  );
}
