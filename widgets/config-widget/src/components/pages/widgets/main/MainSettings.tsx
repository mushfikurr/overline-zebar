import { useAppSetting } from '@overline-zebar/config';
import {
  FieldDescription,
  FieldInput,
  FieldTitle,
  FormField,
  Input,
  PanelLayout,
} from '@overline-zebar/ui';
import PanelHeading from '../../../PanelHeading';
import WeatherThresholds from './components/WeatherThresholds';

type Props = {};

export function MainSettings({}: Props) {
  const [flowLauncherPath, setFlowLauncherPath] =
    useAppSetting('flowLauncherPath');
  const [mediaMaxWidth, setMediaMaxWidth] = useAppSetting('mediaMaxWidth');

  return (
    <PanelLayout title="Main">
      <div className="px-3 py-1">
        <PanelHeading
          title="Main (Topbar)"
          description="Customise your main topbar widget."
        />
        <div className="space-y-8">
          <FormField>
            <FieldTitle>Launcher Path</FieldTitle>
            <FieldInput>
              <Input
                placeholder="e.g., C:\Users\YourUser\AppData\Local\FlowLauncher\Flow.Launcher.exe"
                value={flowLauncherPath}
                onChange={(e) => setFlowLauncherPath(e.target.value)}
              />
            </FieldInput>
            <FieldDescription>
              Specify the full path to your Launcher executable (the search
              button, leftmost of the topbar widget).
            </FieldDescription>
          </FormField>
          <FormField>
            <FieldTitle>Media Max Width (px)</FieldTitle>
            <FieldInput>
              <Input
                placeholder="e.g., 400"
                value={mediaMaxWidth}
                onChange={(e) => setMediaMaxWidth(e.target.value)}
                type="number"
              />
            </FieldInput>
            <FieldDescription>
              Set the maximum width for media displayed in the topbar widget.
            </FieldDescription>
          </FormField>

          <h3 className="my-3.5 text-text-muted">Weather Settings</h3>
          <WeatherThresholds />
        </div>
      </div>
    </PanelLayout>
  );
}
