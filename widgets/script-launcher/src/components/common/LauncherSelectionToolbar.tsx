import { Button, ButtonGroup, ButtonGroupText } from '@overline-zebar/ui';
import { FolderOutput, Trash2, X } from 'lucide-react';

export function LauncherSelectionToolbar({
  selectedIds,
  onMoveOut,
  onDelete,
  onClear,
  size = 'md',
  className,
}: {
  selectedIds: string[];
  onMoveOut?: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
  onClear: () => void;
  size?: 'sm' | 'md';
  className?: string;
}) {
  if (selectedIds.length === 0) return null;

  const iconSize = size === 'sm' ? 'icon-sm' : 'icon';

  return (
    <ButtonGroup
      className={`animate-in fade-in slide-in-from-bottom-1 duration-150 motion-reduce:animate-none ${
        size === 'sm' ? 'h-6' : 'h-7'
      } ${className ?? ''}`}
    >
      <ButtonGroupText
        role="status"
        className={`select-none ${size === 'sm' ? 'text-xs' : ''}`}
      >
        <span className="text-text font-semibold tabular-nums leading-none">
          {selectedIds.length}
        </span>
        selected
      </ButtonGroupText>
      {onMoveOut && (
        <Button
          variant="default"
          size={iconSize}
          title="Move to top level"
          aria-label="Move selected to top level"
          onClick={() => onMoveOut(selectedIds)}
        >
          <FolderOutput />
        </Button>
      )}
      <Button
        variant="default"
        size={iconSize}
        title="Delete selected"
        aria-label="Delete selected"
        className="hover:bg-danger/15 hover:text-danger"
        onClick={() => onDelete(selectedIds)}
      >
        <Trash2 />
      </Button>
      <Button
        variant="default"
        size={iconSize}
        title="Clear selection (Esc)"
        aria-label="Clear selection"
        onClick={onClear}
      >
        <X />
      </Button>
    </ButtonGroup>
  );
}
