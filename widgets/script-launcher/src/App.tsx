import { useWidgetSetting } from '@overline-zebar/config';
import { UpdateScriptModal } from '@overline-zebar/config-widget';
import { LauncherCommand } from '@overline-zebar/config/src/types';
import { generateId } from '@overline-zebar/config/src/utils/generateId';
import { logger } from '@overline-zebar/config/src/utils/logger';
import {
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from '@overline-zebar/ui';
import {
  AppWindow,
  FileCode,
  LucideIcon,
  Plus,
  Search,
  Settings,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import * as zebar from 'zebar';

const providers = zebar.createProviderGroup({
  glazewm: { type: 'glazewm' },
});

// Helper to get Lucide icon component by name
const getLucideIcon = (iconName: string): LucideIcon | null => {
  const iconMap: { [key: string]: LucideIcon } = {
    AppWindow: AppWindow,
    FileCode: FileCode,
    Settings: Settings,
    Search: Search, // Default icon if none is specified
  };
  return iconMap[iconName] || null;
};

function App() {
  const [output, setOutput] = useState(providers.outputMap);
  const [applications, setApplications] = useWidgetSetting(
    'script-launcher',
    'applications'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newApp, setNewApp] = useState<LauncherCommand>({
    id: '',
    title: '',
    command: '',
    args: [],
    icon: 'Search',
  });

  useEffect(() => {
    providers.onOutput(() => setOutput(providers.outputMap));

    zebar.currentWidget().tauriWindow.listen('tauri://blur', () => {
      zebar.currentWidget().close();
    });
  }, []);

  const handleOnSettingsClick = () => {
    zebar.startWidgetPreset('config-widget', 'default');
  };

  const handleAddOrUpdate = () => {
    if (editingId) {
      setApplications(
        applications.map((app) => (app.id === editingId ? newApp : app))
      );
    } else {
      setApplications([
        ...applications,
        { ...newApp, id: generateId(), args: newApp.args },
      ]);
    }
    setNewApp({ id: '', title: '', command: '', args: [], icon: 'Search' });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleOpenModalForAdd = () => {
    setEditingId(null);
    setNewApp({ id: '', title: '', command: '', args: [], icon: 'Search' });
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (appToEdit: LauncherCommand) => {
    setEditingId(appToEdit.id);
    setNewApp(appToEdit);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setApplications(
      applications.filter((app: LauncherCommand) => app.id !== id)
    );
  };

  return (
    <div className="relative shadow-sm bg-background/95 border border-button-border/80 h-screen backdrop-blur-xl text-text antialiased select-none rounded-lg font-mono">
      <UpdateScriptModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        newApp={newApp}
        setNewApp={setNewApp}
        editingId={editingId}
        onAddOrUpdate={handleAddOrUpdate}
      />
      <div className="flex flex-col h-full w-full gap-1">
        {applications.length == 0 && (
          <div className="grow flex flex-col gap-2 items-center justify-center p-2">
            <h1 className="text-center">Scripts you add will show up here</h1>
            <p className="text-text-muted text-center max-w-xs">
              These can be .exe paths, AHK scripts you commonly use, or
              generally just any shell command.
            </p>
          </div>
        )}
        {applications.length > 0 && (
          <div className="grid grow grid-cols-3 grid-rows-4 gap-2 w-full p-2">
            {applications.map((application: LauncherCommand) => (
              <LauncherButton
                key={application.id}
                glazewm={output.glazewm}
                application={application}
                onEdit={() => handleOpenModalForEdit(application)}
                onDelete={() => handleDelete(application.id)}
              />
            ))}
          </div>
        )}
        <div className="flex bg-background rounded-md rounded-t-none justify-end items-center border-t border-border/60 p-2 gap-2">
          <Button onClick={handleOpenModalForAdd} size="icon">
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </Button>
          <Button onClick={handleOnSettingsClick} size="icon">
            <Settings className="h-5 w-5" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function LauncherButton({
  glazewm,
  application,
  onEdit,
  onDelete,
}: {
  glazewm: zebar.GlazeWmOutput | null;
  application: LauncherCommand;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const handleOnLauncherClick = async () => {
    if (!glazewm) return;
    logger.log('Launching command', application.command, application.args);
    await glazewm.runCommand(
      `shell-exec ${application.command} ${application.args.join(' ')}`
    );
  };

  const IconComponent = application.icon
    ? getLucideIcon(application.icon)
    : Search;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Button
          className="h-full w-full flex flex-col gap-1.5 p-2"
          variant="ghost"
          onClick={handleOnLauncherClick}
        >
          {IconComponent && (
            <IconComponent strokeWidth={3} className="h-full w-full grow" />
          )}
          <span>{application.title}</span>
        </Button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuLabel>{application.title}</ContextMenuLabel>
          <ContextMenuItem onClick={onEdit}>Edit</ContextMenuItem>
          <ContextMenuItem onClick={onDelete}>Delete</ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default App;
