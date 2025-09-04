import { useWidgetSetting } from '@overline-zebar/config';
import { LauncherCommand } from '@overline-zebar/config/src/types';
import { generateId } from '@overline-zebar/config/src/utils/generateId';
import {
  Button,
  Card,
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
  Settings,
  Trash2,
} from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';

const predefinedIcons = [
  { label: 'App Icon', value: 'AppWindow', icon: AppWindow },
  { label: 'Script Icon', value: 'FileCode', icon: FileCode },
  { label: 'Settings Icon', value: 'Settings', icon: Settings },
];

const getLucideIcon = (iconName: string): LucideIcon | null => {
  const iconMap: { [key: string]: LucideIcon } = {
    AppWindow: AppWindow,
    FileCode: FileCode,
    Settings: Settings,
  };
  return iconMap[iconName] || null;
};

// Component for editing arguments
function ArgumentEditor({
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
      {args.map((arg, index) => (
        <div key={index} className="flex items-center gap-2 mt-2">
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
      <Button onClick={handleAddArg} className="mt-2">
        <Plus className="h-4 w-4 mr-2" />
        Add Argument
      </Button>
    </div>
  );
}

// Modal for adding/editing an application
function ApplicationModal({
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
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Select
              value={newApp.icon || ''}
              onValueChange={(value) =>
                setNewApp({ ...newApp, icon: value as string })
              }
            >
              <SelectTrigger>
                <SelectValue>
                  {(value: string) => {
                    const option = predefinedIcons.find(
                      (opt) => opt.value === value
                    );
                    return option ? option.label : '';
                  }}
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

// Component for a single application item in the list
function ApplicationItem({
  app,
  onEdit,
  onDelete,
}: {
  app: LauncherCommand;
  onEdit: (app: LauncherCommand) => void;
  onDelete: (id: string) => void;
}) {
  const IconComponent = app.icon ? getLucideIcon(app.icon) : null;

  return (
    <Card key={app.id}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          {IconComponent ? (
            <IconComponent className="h-8 w-8 flex-shrink-0" />
          ) : (
            <div className="w-8 h-full bg-background-deeper rounded-md flex-shrink-0" />
          )}
          <div className="flex flex-col gap-1">
            <h1 className="font-semibold">{app.title}</h1>
            {app.command && (
              <div className="mt-1 text-sm text-text/80 flex flex-wrap gap-1">
                {app.command && <h2>{app.command}</h2>}
                {!!app.args.length &&
                  app.args.map((arg, index) => (
                    <span
                      key={index}
                      className="bg-button text-text px-2 py-1 rounded-md"
                    >
                      {arg}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => onEdit(app)}>Edit</Button>
          <Button onClick={() => onDelete(app.id)}>
            <Trash2 />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Main component for the applications tab
export function ApplicationsTab() {
  const [applications, setApplications] = useWidgetSetting(
    'app-launcher',
    'applications'
  );
  const [newApp, setNewApp] = useState<LauncherCommand>({
    id: '',
    title: '',
    command: '',
    args: [],
    icon: undefined,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddOrUpdate = () => {
    if (editingId) {
      setApplications(
        applications.map((app: LauncherCommand) =>
          app.id === editingId ? { ...newApp, args: newApp.args } : app
        )
      );
    } else {
      setApplications([
        ...applications,
        { ...newApp, id: generateId(), args: newApp.args },
      ]);
    }
    setNewApp({ id: '', title: '', command: '', args: [], icon: undefined });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleOpenModalForEdit = (app: LauncherCommand) => {
    setEditingId(app.id);
    setNewApp({ ...app, args: app.args });
    setIsModalOpen(true);
  };

  const handleOpenModalForAdd = () => {
    setEditingId(null);
    setNewApp({ id: '', title: '', command: '', args: [], icon: undefined });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setApplications(
      applications.filter((app: LauncherCommand) => app.id !== id)
    );
  };

  return (
    <div className="space-y-6">
      <Button onClick={handleOpenModalForAdd}>
        <Plus className="h-4 w-4 mr-2" />
        Add New Application
      </Button>

      <ApplicationModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        newApp={newApp}
        setNewApp={setNewApp}
        editingId={editingId}
        onAddOrUpdate={handleAddOrUpdate}
      />

      <div className="space-y-4">
        <h3 className="font-medium">Existing Applications</h3>
        {applications.map((app: LauncherCommand) => (
          <ApplicationItem
            key={app.id}
            app={app}
            onEdit={handleOpenModalForEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
