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

type Props = {};

export function MainSettings({}: Props) {
  return (
    <PanelLayout title="Main">
      <Tabs defaultValue="general">
        <div className="px-3 py-1">
          <PanelHeading
            title="Main (Topbar)"
            description="Customise your main topbar widget."
            separator={false}
          />
          <TabsList className="mt-4 mb-1">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
          </TabsList>
          <div className="w-full bg-text/5 h-px my-4 mb-6"></div>

          <TabsContent value="general" className="space-y-8">
            <GeneralTab />
          </TabsContent>
          <TabsContent value="weather" className="space-y-8">
            <WeatherTab />
          </TabsContent>
        </div>
      </Tabs>
    </PanelLayout>
  );
}
