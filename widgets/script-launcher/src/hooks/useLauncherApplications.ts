import {
  generateId,
  isLauncherFolder,
  useWidgetSetting,
  type LauncherCommand,
  type LauncherFolder,
} from '@overline-zebar/config';
import {
  deleteFolderKeepChildren,
  groupIntoFolder,
  moveIntoFolder,
  moveToTopLevel,
  moveUpLevel,
} from '@/utils/transforms';
import { useEffect, useRef, useState } from 'react';

export type PendingLauncherDelete =
  | { kind: 'script'; app: LauncherCommand }
  | { kind: 'folder'; folder: LauncherFolder }
  | { kind: 'items'; ids: string[] };

const EMPTY_APP: LauncherCommand = {
  id: '',
  title: '',
  command: '',
  args: [],
  icon: undefined,
  iconPath: undefined,
  iconData: undefined,
};

export function useLauncherApplications() {
  const [applications, setApplications] = useWidgetSetting(
    'script-launcher',
    'applications'
  );

  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newApp, setNewApp] = useState<LauncherCommand>({ ...EMPTY_APP });
  const addParentIdRef = useRef<string | null>(null);

  const openScriptModalForAdd = (parentId?: string) => {
    addParentIdRef.current = parentId ?? null;
    setEditingId(null);
    setNewApp({ ...EMPTY_APP });
    setIsScriptModalOpen(true);
  };

  const openScriptModalForEdit = (appToEdit: LauncherCommand) => {
    addParentIdRef.current = null;
    setEditingId(appToEdit.id);
    setNewApp({ ...appToEdit });
    setIsScriptModalOpen(true);
  };

  const commitScript = () => {
    if (editingId) {
      setApplications(
        applications.map((item) =>
          item.id === editingId && !isLauncherFolder(item) ? newApp : item
        )
      );
    } else {
      const parentId = addParentIdRef.current ?? undefined;
      setApplications([
        ...applications,
        { ...newApp, id: generateId(), parentId },
      ]);
    }
    setNewApp({ ...EMPTY_APP });
    setEditingId(null);
    setIsScriptModalOpen(false);
  };

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');
  const [pendingGroup, setPendingGroup] = useState<string[] | null>(null);

  useEffect(() => {
    if (!isFolderModalOpen) setPendingGroup(null);
  }, [isFolderModalOpen]);

  const openFolderModalForAdd = () => {
    setEditingFolderId(null);
    setFolderName('');
    setIsFolderModalOpen(true);
  };

  const openFolderModalForRename = (folder: LauncherFolder) => {
    setEditingFolderId(folder.id);
    setFolderName(folder.title);
    setIsFolderModalOpen(true);
  };

  const stageGrouping = (memberIds: string[]) => {
    setPendingGroup(memberIds);
    setEditingFolderId(null);
    setFolderName('');
    setIsFolderModalOpen(true);
  };

  const commitFolder = () => {
    const title = folderName.trim();
    if (!title) return;

    if (editingFolderId) {
      setApplications(
        applications.map((item) =>
          isLauncherFolder(item) && item.id === editingFolderId
            ? { ...item, title }
            : item
        )
      );
    } else if (pendingGroup) {
      setApplications(
        groupIntoFolder(applications, pendingGroup, {
          id: generateId(),
          type: 'folder',
          title,
        })
      );
    } else {
      setApplications([
        ...applications,
        { id: generateId(), type: 'folder', title },
      ]);
    }
    setPendingGroup(null);
    setFolderName('');
    setEditingFolderId(null);
    setIsFolderModalOpen(false);
  };

  const [pendingDelete, setPendingDelete] =
    useState<PendingLauncherDelete | null>(null);

  const requestDeleteScript = (id: string) => {
    const app = applications.find(
      (item): item is LauncherCommand =>
        item.id === id && !isLauncherFolder(item)
    );
    if (app) setPendingDelete({ kind: 'script', app });
  };

  const requestDeleteFolder = (folder: LauncherFolder) => {
    setPendingDelete({ kind: 'folder', folder });
  };

  const requestDeleteItems = (ids: string[]) => {
    if (ids.length > 0) setPendingDelete({ kind: 'items', ids });
  };

  const dismissDelete = () => setPendingDelete(null);

  const deleteScripts = (ids: string[]) => {
    const idSet = new Set(ids);
    setApplications(applications.filter((item) => !idSet.has(item.id)));
  };

  const deleteFolder = (folder: LauncherFolder) => {
    setApplications(deleteFolderKeepChildren(applications, folder));
  };

  const deleteItems = (ids: string[]) => {
    const idSet = new Set(ids);
    if (!applications.some((item) => idSet.has(item.id))) return;

    let next = applications;
    for (const item of applications) {
      if (isLauncherFolder(item) && idSet.has(item.id)) {
        next = deleteFolderKeepChildren(next, item);
      }
    }
    const scriptIds = new Set(
      applications
        .filter((item) => !isLauncherFolder(item) && idSet.has(item.id))
        .map((item) => item.id)
    );
    setApplications(next.filter((item) => !scriptIds.has(item.id)));
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === 'script') {
      deleteScripts([pendingDelete.app.id]);
    } else if (pendingDelete.kind === 'folder') {
      deleteFolder(pendingDelete.folder);
    } else {
      deleteItems(pendingDelete.ids);
    }
    setPendingDelete(null);
  };

  const moveScriptsIntoFolder = (ids: string[], folderId: string) => {
    setApplications(moveIntoFolder(applications, ids, folderId));
  };

  const moveScriptsToTopLevel = (ids: string[]) => {
    setApplications(moveToTopLevel(applications, ids));
  };

  const moveScriptsUpLevel = (ids: string[]) => {
    setApplications(moveUpLevel(applications, ids));
  };

  return {
    applications,
    setApplications,
    isScriptModalOpen,
    setIsScriptModalOpen,
    editingId,
    newApp,
    setNewApp,
    openScriptModalForAdd,
    openScriptModalForEdit,
    commitScript,
    isFolderModalOpen,
    setIsFolderModalOpen,
    editingFolderId,
    folderName,
    setFolderName,
    openFolderModalForAdd,
    openFolderModalForRename,
    stageGrouping,
    commitFolder,
    pendingDelete,
    requestDeleteScript,
    requestDeleteFolder,
    requestDeleteItems,
    dismissDelete,
    confirmDelete,
    deleteScripts,
    deleteFolder,
    deleteItems,
    moveScriptsIntoFolder,
    moveScriptsToTopLevel,
    moveScriptsUpLevel,
  };
}

export type LauncherApplicationsModel = ReturnType<
  typeof useLauncherApplications
>;
