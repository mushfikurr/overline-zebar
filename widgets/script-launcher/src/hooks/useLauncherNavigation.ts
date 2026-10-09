import { isLauncherFolder } from '@overline-zebar/config';
import type { LauncherFolder, LauncherItem } from '@overline-zebar/config';
import { getFolderContents, groupScriptsByFolder } from '@/utils/queries';
import { getFolderCounts } from '@/utils/transforms';
import { useCallback, useEffect, useMemo, useState } from 'react';

/** Owns search, folder navigation, expansion and everything derived from them. */
export function useLauncherNavigation(applications: LauncherItem[]) {
  const [query, setQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<string[]>([]);

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

  const openFolder = useCallback((folderId: string) => {
    setQuery('');
    setCurrentFolderId(folderId);
  }, []);

  const toggleFolderExpanded = useCallback((folderId: string) => {
    setExpandedFolderIds((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  }, []);

  // Leave a folder that no longer exists (e.g. deleted from another view).
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

  return {
    query,
    setQuery,
    isSearching,
    currentFolderId,
    setCurrentFolderId,
    currentFolder,
    visibleItems,
    folderCounts,
    folderOptions,
    folderChildren,
    enterTargetId,
    expandedFolderIds,
    toggleFolderExpanded,
    openFolder,
  };
}
