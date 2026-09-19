import { LauncherCommand } from '@overline-zebar/config/src/types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FieldInput,
  FieldTitle,
  FormField,
  Input,
} from '@overline-zebar/ui';
import { Plus, Terminal, Trash2 } from 'lucide-react';
import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react';
import { useTauriFileDrop } from '../hooks/useTauriFileDrop';
import { IconPicker } from './icons';
import { ScriptItemContent } from './pages/widgets/script-launcher/components/ScriptItemContent';

// Component for editing arguments
export function ArgumentEditor({
  args,
  onChange,
}: {
  args: string[];
  onChange: (newArgs: string[]) => void;
}) {
  // Set when a row is added so its input focuses on mount.
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  const handleArgChange = (index: number, value: string) => {
    const newArgs = [...args];
    newArgs[index] = value;
    onChange(newArgs);
  };

  const handleRemoveArg = (index: number) => {
    const newArgs = [...args];
    newArgs.splice(index, 1);
    onChange(newArgs);
  };

  const handleAddArg = () => {
    setFocusIndex(args.length);
    onChange([...args, '']);
  };

  const addRowClassName =
    'border-border/60 text-text-muted hover:border-button-border hover:bg-background-deeper/40 hover:text-text focus-visible:border-primary focus-visible:ring-primary/50 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed text-xs outline-none transition-[background-color,border-color,box-shadow,color] duration-150 ease-out focus-visible:ring-[3px]';

  return (
    <FormField>
      <FieldTitle>Arguments</FieldTitle>
      <FieldInput className="space-y-2">
        {args.length === 0 ? (
          <button
            type="button"
            onClick={handleAddArg}
            className="border-border/60 hover:border-button-border hover:bg-background-deeper/40 focus-visible:border-primary focus-visible:ring-primary/50 group flex w-full flex-col items-center gap-1 rounded-md border border-dashed px-4 py-5 text-center outline-none transition-[background-color,border-color,box-shadow,color] duration-150 ease-out focus-visible:ring-[3px]"
          >
            <Terminal
              className="text-text-muted group-hover:text-text size-5 transition-colors duration-150"
              strokeWidth={1.5}
            />
            <span className="text-text text-sm font-medium">No arguments</span>
            <span className="text-text-muted text-pretty text-xs">
              Click to add flags that run after the command, like --new-window.
            </span>
          </button>
        ) : (
          <>
            {args.map((arg, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={arg}
                  onChange={(e) => handleArgChange(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddArg();
                    }
                  }}
                  placeholder="e.g. --new-window"
                  aria-label={`Argument ${index + 1}`}
                  autoComplete="off"
                  spellCheck={false}
                  autoFocus={focusIndex === index}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  title={`Remove argument ${index + 1}`}
                  aria-label={`Remove argument ${index + 1}`}
                  className="hover:bg-danger/15 hover:text-danger"
                  onClick={() => handleRemoveArg(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <button type="button" onClick={handleAddArg} className={`${addRowClassName} h-7`}>
              <Plus className="size-3" />
              Add argument
            </button>
          </>
        )}
      </FieldInput>
    </FormField>
  );
}

// Modal for adding/editing an application
export function UpdateScriptModal({
  open,
  setOpen,
  newApp,
  setNewApp,
  editingId,
  onAddOrUpdate,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  newApp: LauncherCommand;
  setNewApp: Dispatch<SetStateAction<LauncherCommand>>;
  editingId: string | null;
  onAddOrUpdate: () => void;
}) {
  const isEditing = editingId !== null;
  const commandRowRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const canSubmit = newApp.title.trim() !== '' && newApp.command.trim() !== '';

  const handleDroppedFile = useCallback(
    (path: string) => {
      setNewApp((current) => ({ ...current, command: path }));
    },
    [setNewApp]
  );

  const handleDragOverChange = useCallback((isOver: boolean) => {
    setIsDragOver(isOver);
  }, []);

  useTauriFileDrop({
    targetRef: commandRowRef,
    enabled: open,
    onFile: handleDroppedFile,
    onDragOverChange: handleDragOverChange,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {isEditing ? 'Edit script' : 'Add script'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of your script.'
              : 'Add a new script to your launcher.'}
          </DialogDescription>
        </DialogHeader>
        <div className="-mt-2 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col gap-y-6 py-4">
            <div className="border-border bg-background-deeper/40 flex items-center gap-3 rounded-lg border px-3 py-2.5">
              <ScriptItemContent
                app={newApp}
                fallbackTitle={newApp.title || 'Untitled script'}
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <div className="flex gap-2">
                <IconPicker
                  value={{
                    icon: newApp.icon,
                    iconPath: newApp.iconPath,
                    iconData: newApp.iconData,
                    iconColor: newApp.iconColor,
                  }}
                  onChange={({ icon, iconPath, iconData, iconColor }) =>
                    setNewApp({ ...newApp, icon, iconPath, iconData, iconColor })
                  }
                />
                <div className="min-w-0 flex-1">
                  <Input
                    value={newApp.title}
                    onChange={(e) =>
                      setNewApp({ ...newApp, title: e.target.value })
                    }
                    placeholder="Title for your script"
                    aria-label="Title"
                  />
                </div>
              </div>
              <div
                ref={commandRowRef}
                className={`flex items-center gap-2 rounded-md transition-shadow duration-150 ${
                  isDragOver ? 'ring-primary/60 ring-[3px]' : ''
                }`}
              >
                <Input
                  value={newApp.command}
                  onChange={(e) =>
                    setNewApp({ ...newApp, command: e.target.value })
                  }
                  placeholder="Shell command, AHK script, .exe path, etc. Or drag a file here"
                  aria-label="Command"
                />
              </div>
            </div>
            <ArgumentEditor
              args={newApp.args}
              onChange={(newArgs) => {
                setNewApp({ ...newApp, args: newArgs });
              }}
            />
          </div>
        </div>
        <DialogFooter className="-mx-6 -mb-6 shrink-0 border-t border-border/60 bg-background-deeper/40 px-6 py-4 backdrop-blur-xl">
          <Button onClick={onAddOrUpdate} disabled={!canSubmit}>
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
