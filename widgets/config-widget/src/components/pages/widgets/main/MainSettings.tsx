import {
  PanelLayout,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@overline-zebar/ui';
import PanelHeading from '../../../PanelHeading';
import GeneralTab from './components/GeneralTab';
import SystemStatsTab from './components/SystemStatsTab';
import SystrayTab from './components/SystrayTab';
import TimeTab from './components/TimeTab';

export function MainSettings() {
  return (
    <PanelLayout>
      <Tabs defaultValue="general" className="flex-grow gap-0">
        <PanelHeading title="Top Bar" description="Customise your top bar.">
          <TabsList className="mt-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
            <TabsTrigger value="system-stats">Stats</TabsTrigger>
            <TabsTrigger value="systray">System Tray</TabsTrigger>
          </TabsList>
        </PanelHeading>
        <TabsContent value="general" className="space-y-8 flex-none px-4 py-4">
          <GeneralTab />
        </TabsContent>
        <TabsContent value="time" className="space-y-8 flex-none px-4 py-4">
          <TimeTab />
        </TabsContent>
        <TabsContent
          value="system-stats"
          className="space-y-8 flex-none px-4 py-4"
        >
          <SystemStatsTab />
        </TabsContent>
        <TabsContent value="systray" className="space-y-3 flex-none px-4 py-4">
          <SystrayTab />
        </TabsContent>
      </Tabs>
    </PanelLayout>
  );
}
