import {
  PanelLayout,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@overline-zebar/ui';
import PanelHeading from '../../../PanelHeading';
import GeneralTab from './components/GeneralTab';
import WeatherTab from './components/WeatherTab';
import SystrayTab from './components/SystrayTab';

export function MainSettings() {
  return (
    <PanelLayout title="Main">
      <Tabs defaultValue="general" className="flex-grow">
        <div className="px-3 py-1 flex flex-col flex-grow">
          <PanelHeading
            title="Main (Topbar)"
            description="Customise your main topbar widget."
            separator={false}
          />
          <TabsList className="mt-4 mb-1">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
            <TabsTrigger value="systray">System Tray</TabsTrigger>
          </TabsList>
          <div className="w-full bg-text/5 h-px my-4 mb-6"></div>

          <TabsContent value="general" className="space-y-8 overflow-y-auto">
            <GeneralTab />
          </TabsContent>
          <TabsContent value="weather" className="space-y-8 overflow-y-auto">
            <WeatherTab />
          </TabsContent>
          <TabsContent
            value="systray"
            className="flex flex-col flex-grow space-y-8 overflow-y-auto"
          >
            <SystrayTab />
          </TabsContent>
        </div>
      </Tabs>
    </PanelLayout>
  );
}
