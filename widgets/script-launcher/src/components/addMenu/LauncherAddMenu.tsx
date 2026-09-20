import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@overline-zebar/ui';
import { FilePlus2, FolderPlus, Plus } from 'lucide-react';
import type { ComponentProps } from 'react';

export function LauncherAddMenu({
  onAddScript,
  onAddFolder,
  canAddFolder,
}: {
  onAddScript: () => void;
  onAddFolder: () => void;
  canAddFolder: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(triggerProps: ComponentProps<typeof Button>) => (
          <Button {...triggerProps} size="icon" title="Add" aria-label="Add">
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </Button>
        )}
      />
      <DropdownMenuContent side="top" align="end" sideOffset={6}>
        <DropdownMenuItem onClick={onAddScript}>
          <FilePlus2 />
          Add script
        </DropdownMenuItem>
        {canAddFolder && (
          <DropdownMenuItem onClick={onAddFolder}>
            <FolderPlus />
            Add folder
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
