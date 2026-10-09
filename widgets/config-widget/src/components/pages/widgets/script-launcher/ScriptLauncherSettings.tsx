import SettingsPage from '@/components/SettingsPage';
import { ApplicationsTab } from './components/ApplicationsTab';

export function ScriptLauncherSettings() {
  return (
    <SettingsPage
      title="Script Launcher"
      description="Configure how the launcher widget displays your scripts."
    >
      <ApplicationsTab />
    </SettingsPage>
  );
}
