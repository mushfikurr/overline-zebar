import { PARENT_DROP_ID } from '../hooks/useLauncherDnd';
import { Button } from '@overline-zebar/ui';
import { useDroppable } from '@dnd-kit/core';
import { ChevronLeft } from 'lucide-react';
import { FolderSquare } from './icons';
import { cn } from '../utils/cn';

export function FolderHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: PARENT_DROP_ID });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-surface flex shrink-0 items-center gap-1.5 rounded-md px-2 pt-3 pb-1.5 transition-colors duration-150',
        isOver && 'bg-primary/15'
      )}
    >
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onBack}
        title="Back to all scripts"
        aria-label="Back to all scripts"
        className="text-text-muted hover:text-text"
      >
        <ChevronLeft className="size-4" strokeWidth={2.5} />
      </Button>
      <FolderSquare className="size-5" glyphClassName="size-3.5" />
      <span className="text-text-muted min-w-0 flex-1 truncate text-xs font-medium leading-none">
        {title}
      </span>
      {isOver && (
        <span className="text-text-muted shrink-0 text-xs leading-none">
          Release to move out
        </span>
      )}
    </div>
  );
}
