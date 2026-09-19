import { Check, FolderPlus } from 'lucide-react';
import { cn } from '../../utils/cn';

const badgeMotion =
  'animate-in fade-in zoom-in-75 duration-150 motion-reduce:animate-none';

export function FolderTargetBadge() {
  return (
    <span
      className={cn(
        'bg-primary pointer-events-none absolute -top-1.5 -right-1.5 z-10 flex size-4 items-center justify-center rounded-full text-white shadow-md',
        badgeMotion
      )}
    >
      <FolderPlus className="size-2.5" strokeWidth={2.5} />
    </span>
  );
}

export function SelectedBadge() {
  return (
    <span
      className={cn(
        'bg-primary pointer-events-none absolute -top-1.5 -right-1.5 z-10 flex size-4 items-center justify-center rounded-full text-white shadow-md',
        badgeMotion
      )}
    >
      <Check className="size-2.5" strokeWidth={3.5} />
    </span>
  );
}

export function LauncherItemBadges({
  isFolderTarget,
  isSelected,
}: {
  isFolderTarget: boolean;
  isSelected: boolean;
}) {
  return isFolderTarget ? (
    <FolderTargetBadge />
  ) : isSelected ? (
    <SelectedBadge />
  ) : null;
}
