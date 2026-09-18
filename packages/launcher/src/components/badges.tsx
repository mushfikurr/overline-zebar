import { Check, FolderPlus } from 'lucide-react';

/** Shared pop-in for the small affordance badges: quick zoom from 75%,
 * gentle enough to not slow ctrl-click selection spam. */
const badgeMotion =
  'animate-in fade-in zoom-in-75 duration-150 motion-reduce:animate-none';

/** Affordance shown on an item whose spring-loaded folder action has
 * committed: release to tuck in / group. */
export function FolderTargetBadge() {
  return (
    <span
      className={`bg-primary pointer-events-none absolute -top-1.5 -right-1.5 z-10 flex size-4 items-center justify-center rounded-full text-white shadow-md ${badgeMotion}`}
    >
      <FolderPlus className="size-2.5" strokeWidth={2.5} />
    </span>
  );
}

export function SelectedBadge() {
  return (
    <span
      className={`bg-primary pointer-events-none absolute -top-1.5 -right-1.5 z-10 flex size-4 items-center justify-center rounded-full text-white shadow-md ${badgeMotion}`}
    >
      <Check className="size-2.5" strokeWidth={3.5} />
    </span>
  );
}
