import SettingsPage from '@/components/SettingsPage';
import { ApplicationsTab } from './components/ApplicationsTab';

export function ScriptLauncherSettings() {
  return (
    <SettingsPage
      title="Script Launcher"
      description="Manage the scripts shown in your launcher widget."
    >
      <ApplicationsTab />
    </SettingsPage>
  );
}
