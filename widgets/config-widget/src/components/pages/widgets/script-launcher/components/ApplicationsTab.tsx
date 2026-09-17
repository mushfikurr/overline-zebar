import { AppIcon } from '@/components/icons';
import { UpdateScriptModal } from '@/components/UpdateScriptModal';
import { useWidgetSetting } from '@overline-zebar/config';
import { LauncherCommand } from '@overline-zebar/config/src/types';
import { generateId } from '@overline-zebar/config/src/utils/generateId';
import {
  Button,
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@overline-zebar/ui';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

// Component for a single application item in the list
function ScriptItem({
  app,
  onEdit,
  onDelete,
}: {
  app: LauncherCommand;
  onEdit: (app: LauncherCommand) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card key={app.id}>
      <div className="flex items-center justify-between p-4">
        <div className="flex min-w-0 items-center gap-4">
          <AppIcon app={app} className="h-8 w-8 shrink-0" />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="truncate font-semibold">{app.title}</h1>
            {app.command && (
              <div className="text-text/80 mt-1 flex flex-col flex-wrap gap-2 text-sm">
                <h2 className="truncate">{app.command}</h2>
                {app.args.length > 0 &&
                  app.args.map((arg, index) => (
                    <span
                      key={index}
                      className="bg-button text-text w-fit rounded-md px-2 py-1"
                    >
                      {arg}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
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
    'script-launcher',
    'applications'
  );
  const [view, setView] = useWidgetSetting('script-launcher', 'view');
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
    setNewApp({ ...app, args: app.args, icon: app.icon });
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-medium">Default view</h3>
          <p className="text-text-muted text-sm">
            Layout the launcher opens with.
          </p>
        </div>
        <Select
          value={view ?? 'grid'}
          onValueChange={(value) => setView(value as 'grid' | 'list')}
        >
          <SelectTrigger className="w-28">
            <SelectValue>
              {(value: string) => (value === 'list' ? 'List' : 'Grid')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="list">List</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleOpenModalForAdd}>
        <Plus className="h-4 w-4 mr-2" />
        Add New Application
      </Button>

      <UpdateScriptModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        newApp={newApp}
        setNewApp={setNewApp}
        editingId={editingId}
        onAddOrUpdate={handleAddOrUpdate}
      />

      <div className="space-y-4">
        <h3 className="font-medium">Your Scripts</h3>
        {applications.map((app: LauncherCommand) => (
          <ScriptItem
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
