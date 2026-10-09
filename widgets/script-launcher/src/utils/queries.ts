import {
  isLauncherFolder,
  type LauncherCommand,
  type LauncherItem,
} from '@overline-zebar/config';

export function getFolderContents(
  items: LauncherItem[],
  folderId: string | null
): LauncherItem[] {
  return items.filter((item) => {
    if ((item.parentId ?? null) === folderId) return true;
    if (folderId === null && item.parentId) {
      return !items.some(
        (other) => isLauncherFolder(other) && other.id === item.parentId
      );
    }
    return false;
  });
}

export function groupScriptsByFolder(
  items: LauncherItem[]
): Map<string, LauncherCommand[]> {
  const map = new Map<string, LauncherCommand[]>();
  for (const item of items) {
    if (isLauncherFolder(item)) continue;
    const parent = item.parentId;
    if (!parent) continue;
    const list = map.get(parent);
    if (list) list.push(item);
    else map.set(parent, [item]);
  }
  return map;
}

export function collapseCommandPath(command: string): string {
  const trimmed = command.trim();
  const segments = trimmed.split(/[\\/]+/);
  const last = segments[segments.length - 1];
  return last === undefined || last === '' ? trimmed : last;
}
