import PanelHeading from '@/components/PanelHeading';
import { PanelLayout, Tabs } from '@overline-zebar/ui';
import { ApplicationsTab } from './components/ApplicationsTab';

export function ScriptLauncherSettings() {
  return (
    <PanelLayout>
      <Tabs defaultValue="applications" className="flex-grow gap-0">
        <PanelHeading
          title="Script Launcher"
          description="Manage your scripts."
        />
        <div className="px-4 py-4">
          <ApplicationsTab />
        </div>
      </Tabs>
    </PanelLayout>
  );
}
