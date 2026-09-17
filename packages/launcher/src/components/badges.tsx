import { Check, FolderPlus } from 'lucide-react';

/** Affordance shown on an item whose spring-loaded folder action has
 * committed: release to tuck in / group. */
export function FolderTargetBadge() {
  return (
    <span className="bg-primary pointer-events-none absolute -top-1.5 -right-1.5 z-10 flex size-4 items-center justify-center rounded-full text-white shadow-md">
      <FolderPlus className="size-2.5" strokeWidth={2.5} />
    </span>
  );
}

export function SelectedBadge() {
  return (
    <span className="bg-primary pointer-events-none absolute -top-1.5 -right-1.5 z-10 flex size-4 items-center justify-center rounded-full text-white shadow-md">
      <Check className="size-2.5" strokeWidth={3.5} />
    </span>
  );
}
