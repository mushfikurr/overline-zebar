import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FieldDescription,
  FieldInput,
  FieldTitle,
  FormField,
  Input,
} from '@overline-zebar/ui';
import { FolderOpen } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

/** Modal for creating or renaming a launcher folder. */
export function UpdateFolderModal({
  open,
  setOpen,
  name,
  setName,
  editing,
  onSubmit,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  editing: boolean;
  onSubmit: () => void;
}) {
  const canSubmit = name.trim() !== '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>{editing ? 'Rename folder' : 'New folder'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Update the name of your folder.'
              : 'Group related scripts in a folder.'}
          </DialogDescription>
        </DialogHeader>
        <div className="-mt-2 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col gap-y-6 py-4">
            <div className="border-border bg-background-deeper/40 flex items-center gap-3 rounded-lg border px-3 py-2.5">
              <span className="bg-primary/15 text-text flex size-9 shrink-0 items-center justify-center rounded-[22%]">
                <FolderOpen className="size-5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium leading-none">
                {name.trim() || 'Untitled folder'}
              </span>
            </div>
            <FormField>
              <FieldTitle>Name</FieldTitle>
              <FieldInput>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canSubmit) {
                      e.preventDefault();
                      onSubmit();
                    }
                  }}
                  placeholder="e.g. Work scripts"
                  aria-label="Folder name"
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                />
              </FieldInput>
              <FieldDescription>
                Shown in the launcher when the folder is closed.
              </FieldDescription>
            </FormField>
          </div>
        </div>
        <DialogFooter className="-mx-6 -mb-6 shrink-0 border-t border-border/60 bg-background-deeper/40 px-6 py-4 backdrop-blur-xl">
          <Button onClick={onSubmit} disabled={!canSubmit}>
            {editing ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
