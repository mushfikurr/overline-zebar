import PanelHeading from '@/components/PanelHeading';
import { PanelLayout, Tabs } from '@overline-zebar/ui';
import { ApplicationsTab } from './components/ApplicationsTab';

export function AppLauncherSettings() {
  return (
    <PanelLayout title="App Launcher">
      <Tabs defaultValue="applications" className="flex-grow">
        <div className="px-3 py-1 flex flex-col flex-grow">
          <PanelHeading
            title="App Launcher"
            description="Manage your app launcher applications."
          />

          <ApplicationsTab />
        </div>
      </Tabs>
    </PanelLayout>
  );
}
