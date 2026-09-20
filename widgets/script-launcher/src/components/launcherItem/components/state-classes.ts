export const ITEM_STATE_CLASSES = {
  folderTarget: 'bg-primary/15 ring-primary/60 ring-[3px]',
  dwellTarget: 'bg-primary/10 ring-primary/40 ring-2',
  selected: 'bg-primary/10 ring-primary/50 ring-2',
} as const;

export function launcherItemStateClasses({
  isFolderTarget,
  isDwellTarget,
  isSelected,
}: {
  isFolderTarget: boolean;
  isDwellTarget: boolean;
  isSelected: boolean;
}): string {
  return isFolderTarget
    ? ITEM_STATE_CLASSES.folderTarget
    : isDwellTarget
      ? ITEM_STATE_CLASSES.dwellTarget
      : isSelected
        ? ITEM_STATE_CLASSES.selected
        : '';
}
