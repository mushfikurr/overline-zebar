import { LauncherCommand } from '@overline-zebar/config/src/types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
} from '@overline-zebar/ui';
import { Plus, Trash2 } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { IconPicker } from './icons';

// Component for editing arguments
export function ArgumentEditor({
  args,
  onChange,
}: {
  args: string[];
  onChange: (newArgs: string[]) => void;
}) {
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
    onChange([...args, '']);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-text/80">
        Arguments
      </label>
      <div className="mt-2 space-y-2">
        {args.map((arg, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={arg}
              onChange={(e) => handleArgChange(index, e.target.value)}
              placeholder="e.g. --new-window"
            />
            <Button onClick={() => handleRemoveArg(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button onClick={handleAddArg} className="mt-2">
        <Plus className="h-4 w-4 mr-2" />
        Add Argument
      </Button>
    </div>
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {isEditing ? 'Edit Application' : 'Add New Application'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of your application.'
              : 'Add a new application to your launcher.'}
          </DialogDescription>
        </DialogHeader>
        <div className="-mt-2 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col gap-y-4 py-4">
            <div className="flex gap-2">
              <IconPicker
                value={{ icon: newApp.icon, iconPath: newApp.iconPath }}
                onChange={({ icon, iconPath }) =>
                  setNewApp({ ...newApp, icon, iconPath })
                }
              />
              <FormField className="w-full">
                <Input
                  value={newApp.title}
                  onChange={(e) =>
                    setNewApp({ ...newApp, title: e.target.value })
                  }
                  placeholder="Title for your application or command"
                />
              </FormField>
            </div>
            <FormField>
              <Input
                value={newApp.command}
                onChange={(e) =>
                  setNewApp({ ...newApp, command: e.target.value })
                }
                placeholder="Shell command, AHK script, .exe directory, etc."
              />
            </FormField>
            <ArgumentEditor
              args={newApp.args}
              onChange={(newArgs) => {
                setNewApp({ ...newApp, args: newArgs });
              }}
            />
          </div>
        </div>
        <DialogFooter className="-mx-6 -mb-6 shrink-0 border-t border-border/60 bg-background-deeper/40 px-6 py-4 backdrop-blur-xl">
          <Button onClick={onAddOrUpdate}>
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
