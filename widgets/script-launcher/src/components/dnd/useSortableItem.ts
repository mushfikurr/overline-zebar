import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export type LauncherDragDelta = { x: number; y: number } | null;

export function useSortableItem({
  id,
  disabled = false,
  isGhostMover,
  dragDelta,
}: {
  id: string;
  disabled?: boolean;
  isGhostMover: boolean;
  dragDelta: LauncherDragDelta;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  return {
    dragProps: disabled ? {} : { ...attributes, ...listeners },
    setNodeRef,
    style: {
      transform:
        isGhostMover && dragDelta
          ? `translate3d(${dragDelta.x}px, ${dragDelta.y}px, 0)`
          : CSS.Translate.toString(transform),
      transition: isGhostMover ? ('none' as const) : transition,
    },
    className: `${isDragging ? 'opacity-30' : ''} ${
      isGhostMover ? 'z-20' : ''
    }`,
  };
}
