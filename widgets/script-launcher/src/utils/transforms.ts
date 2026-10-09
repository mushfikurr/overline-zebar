import {
  isLauncherFolder,
  type LauncherFolder,
  type LauncherItem,
} from '@overline-zebar/config';

function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const copy = array.slice();
  const [moved] = copy.splice(from, 1);
  if (moved === undefined) return array;
  copy.splice(to, 0, moved);
  return copy;
}

export function reorderWithinLevel(
  items: LauncherItem[],
  activeItemId: string,
  overItemId: string,
  level: string | null
): LauncherItem[] {
  const levelItems = items.filter((item) => (item.parentId ?? null) === level);
  const oldIndex = levelItems.findIndex((item) => item.id === activeItemId);
  const newIndex = levelItems.findIndex((item) => item.id === overItemId);
  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return items;

  const ordered = arrayMove(levelItems, oldIndex, newIndex);
  let cursor = 0;
  return items.map((item) =>
    (item.parentId ?? null) === level ? (ordered[cursor++] ?? item) : item
  );
}

export function reorderBlockWithinLevel(
  items: LauncherItem[],
  dragIds: string[],
  overItemId: string,
  level: string | null
): LauncherItem[] {
  const idSet = new Set(dragIds);
  const levelItems = items.filter((item) => (item.parentId ?? null) === level);
  const moving = levelItems.filter((item) => idSet.has(item.id));
  if (moving.length === 0) return items;
  const others = levelItems.filter((item) => !idSet.has(item.id));
  const insertIndex = others.findIndex((item) => item.id === overItemId);
  if (insertIndex === -1) return items;

  const ordered = [
    ...others.slice(0, insertIndex),
    ...moving,
    ...others.slice(insertIndex),
  ];
  let cursor = 0;
  return items.map((item) =>
    (item.parentId ?? null) === level ? (ordered[cursor++] ?? item) : item
  );
}

export function moveIntoFolder(
  items: LauncherItem[],
  scriptIds: string[],
  folderId: string
): LauncherItem[] {
  const target = items.find(
    (item) => isLauncherFolder(item) && item.id === folderId
  );
  if (!target) return items;

  const idSet = new Set(scriptIds);
  const dragged = items.filter(
    (item) =>
      idSet.has(item.id) && !isLauncherFolder(item) && item.id !== folderId
  );
  if (dragged.length === 0) return items;

  const next = items.filter((item) => !idSet.has(item.id));
  const targetIndex = next.findIndex((item) => item.id === folderId);
  next.splice(
    targetIndex + 1,
    0,
    ...dragged.map((item) => ({ ...item, parentId: folderId }))
  );
  return next;
}

export function groupIntoFolder(
  items: LauncherItem[],
  memberIds: string[],
  folder: LauncherFolder
): LauncherItem[] {
  const memberSet = new Set(memberIds);
  const members = items.filter((item) => memberSet.has(item.id));
  if (members.length === 0) return items;

  let placed = false;
  return items.flatMap((item) => {
    if (!memberSet.has(item.id)) return [item];
    if (placed) return [];
    placed = true;
    return [
      folder,
      ...members.map((member) => ({ ...member, parentId: folder.id })),
    ];
  });
}

export function deleteFolderKeepChildren(
  items: LauncherItem[],
  folder: LauncherFolder
): LauncherItem[] {
  const folderIndex = items.findIndex((item) => item.id === folder.id);
  if (folderIndex === -1) return items;

  const next = items.filter((item) => item.id !== folder.id);
  const children = items
    .filter((item) => !isLauncherFolder(item) && item.parentId === folder.id)
    .map((child) => ({ ...child, parentId: undefined }));
  next.splice(folderIndex, 0, ...children);
  return next;
}

export function moveToTopLevel(
  items: LauncherItem[],
  scriptIds: string[]
): LauncherItem[] {
  const idSet = new Set(scriptIds);
  return items.map((item) =>
    !isLauncherFolder(item) && idSet.has(item.id)
      ? { ...item, parentId: undefined }
      : item
  );
}

export function moveUpLevel(
  items: LauncherItem[],
  scriptIds: string[]
): LauncherItem[] {
  const idSet = new Set(scriptIds);
  const moving = items.filter(
    (item) => !isLauncherFolder(item) && idSet.has(item.id) && item.parentId
  );
  if (moving.length === 0) return items;

  const leaving = new Map<string, LauncherItem[]>();
  for (const script of moving) {
    const parent = script.parentId!;
    const group = leaving.get(parent) ?? [];
    group.push(script);
    leaving.set(parent, group);
  }

  const folderIds = new Set(
    items.filter(isLauncherFolder).map((folder) => folder.id)
  );
  const movingIds = new Set(moving.map((script) => script.id));

  const next: LauncherItem[] = [];
  for (const item of items) {
    if (movingIds.has(item.id)) {
      if (folderIds.has(item.parentId!)) continue;
      next.push({ ...item, parentId: undefined });
      continue;
    }
    next.push(item);
    if (isLauncherFolder(item) && leaving.has(item.id)) {
      next.push(
        ...leaving.get(item.id)!.map((script) => ({
          ...script,
          parentId: item.parentId ?? undefined,
        }))
      );
    }
  }
  return next;
}

export function moveBlockToLevel(
  items: LauncherItem[],
  dragIds: string[],
  overItemId: string
): LauncherItem[] {
  const over = items.find((item) => item.id === overItemId);
  if (!over) return items;
  const targetLevel = over.parentId ?? null;

  const idSet = new Set(dragIds);
  const dragged = items.filter(
    (item) =>
      !isLauncherFolder(item) &&
      idSet.has(item.id) &&
      (item.parentId ?? null) !== targetLevel
  );
  if (dragged.length === 0) return items;

  const draggedIds = new Set(dragged.map((item) => item.id));
  const next = items.filter((item) => !draggedIds.has(item.id));
  const overIndex = next.findIndex((item) => item.id === overItemId);
  if (overIndex === -1) return items;
  next.splice(
    overIndex,
    0,
    ...dragged.map((item) => ({
      ...item,
      parentId: over.parentId ?? undefined,
    }))
  );
  return next;
}

export function getFolderCounts(items: LauncherItem[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (!isLauncherFolder(item) && item.parentId) {
      counts.set(item.parentId, (counts.get(item.parentId) ?? 0) + 1);
    }
  }
  return counts;
}
