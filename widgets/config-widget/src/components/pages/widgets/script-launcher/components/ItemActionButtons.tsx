import { Button } from '@overline-zebar/ui';
import { Pencil, Trash2 } from 'lucide-react';

export function ItemActionButtons({
  editTitle,
  onEdit,
  deleteTitle,
  onDelete,
}: {
  editTitle: string;
  onEdit: () => void;
  deleteTitle: string;
  onDelete: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        title={editTitle}
        aria-label={editTitle}
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      >
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title={deleteTitle}
        aria-label={deleteTitle}
        className="hover:bg-danger/15 hover:text-danger"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 />
      </Button>
    </div>
  );
}
