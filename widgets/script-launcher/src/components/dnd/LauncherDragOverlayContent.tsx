import { isLauncherFolder } from '@overline-zebar/config';
import { DragStackOverlay } from './DragStackOverlay';
import { LauncherDragPreview } from './LauncherDragPreview';
import type { useLauncherDnd } from './useLauncherDnd';

export function LauncherDragOverlayContent({
  dnd,
  view,
  showCommand,
  collapsePath,
}: {
  dnd: ReturnType<typeof useLauncherDnd>;
  view: 'grid' | 'list' | undefined;
  showCommand?: boolean;
  collapsePath?: boolean;
}) {
  const item = dnd.activeItem;
  if (!item) return null;

  return (
    <DragStackOverlay
      count={dnd.multiDragIds !== null ? dnd.multiDragIds.length : null}
    >
      <LauncherDragPreview
        item={item}
        view={view}
        width={dnd.activeRect?.width}
        showCommand={showCommand && !isLauncherFolder(item)}
        collapsePath={collapsePath}
      />
    </DragStackOverlay>
  );
}
