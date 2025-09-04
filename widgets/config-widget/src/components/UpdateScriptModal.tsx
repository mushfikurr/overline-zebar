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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@overline-zebar/ui';
import {
  AppWindow,
  FileCode,
  LucideIcon,
  Plus,
  Search,
  Settings,
  Trash2,
} from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

export const predefinedIcons = [
  { label: 'Search Icon', value: 'Search', icon: Search },
  { label: 'App Icon', value: 'AppWindow', icon: AppWindow },
  { label: 'Script Icon', value: 'FileCode', icon: FileCode },
  { label: 'Settings Icon', value: 'Settings', icon: Settings },
];

export const getLucideIcon = (iconName?: string): LucideIcon => {
  const iconMap: { [key: string]: LucideIcon } = {
    AppWindow: AppWindow,
    FileCode: FileCode,
    Settings: Settings,
    Search: Search,
  };
  if (iconName && iconMap[iconName]) {
    return iconMap[iconName];
  }
  return Search;
};

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
      <div className="max-h-32 overflow-y-auto pr-2 mt-2 space-y-2">
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Application' : 'Add New Application'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of your application.'
              : 'Add a new application to your launcher.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-4 py-4">
          <div className="flex gap-2">
            <Select
              value={newApp.icon || ''}
              onValueChange={(value) =>
                setNewApp({ ...newApp, icon: value as string })
              }
            >
              <SelectTrigger>
                <SelectValue>
                  {(value) =>
                    predefinedIcons.find((f) => f.value == value)?.label
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {predefinedIcons.map((iconOption) => (
                  <SelectItem key={iconOption.value} value={iconOption.value}>
                    <div className="flex items-center gap-2">
                      <iconOption.icon strokeWidth={3} className="h-5 w-5" />
                      {iconOption.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        <DialogFooter>
          <Button onClick={onAddOrUpdate}>
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
