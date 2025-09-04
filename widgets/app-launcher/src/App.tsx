import { useWidgetSetting } from '@overline-zebar/config';
import { LauncherCommand } from '@overline-zebar/config/src/types';
import { logger } from '@overline-zebar/config/src/utils/logger';
import { Button } from '@overline-zebar/ui';
import {
  Search,
  Settings,
  AppWindow,
  FileCode,
  LucideIcon,
} from 'lucide-react'; // Added AppWindow, FileCode, LucideIcon
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
  const [applications] = useWidgetSetting('app-launcher', 'applications');
  useEffect(() => {
    providers.onOutput(() => setOutput(providers.outputMap));

    zebar.currentWidget().tauriWindow.listen('tauri://blur', () => {
      zebar.currentWidget().close();
    });
  }, []);

  const handleOnSettingsClick = () => {
    zebar.startWidgetPreset('config-widget', 'default');
  };

  if (!applications.length) return null;

  return (
    <div className="relative shadow-sm bg-background/95 border border-button-border/80 backdrop-blur-xl text-text h-full antialiased select-none rounded-lg font-mono">
      <div className="flex flex-col h-full w-full min-h-0 gap-1">
        <div className="grid grow grid-cols-3 grid-rows-4 gap-2 w-full p-2">
          {applications.map((application: LauncherCommand) => (
            <LauncherButton
              key={application.id}
              glazewm={output.glazewm}
              application={application}
            />
          ))}
        </div>
        <div className="flex bg-background rounded-md rounded-t-none justify-end items-center border-t border-border/60 p-2">
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
}: {
  glazewm: zebar.GlazeWmOutput | null;
  application: LauncherCommand;
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
  );
}

export default App;
