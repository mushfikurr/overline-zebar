import {
  PanelLayout,
  Input,
  FormField,
  FieldTitle,
  FieldInput,
  FieldDescription,
} from '@overline-zebar/ui';
import { useAppSetting } from '@overline-zebar/config';
import PanelHeading from '../PanelHeading';

export function GeneralSettings() {
  const [flowLauncherPath, setFlowLauncherPath] =
    useAppSetting('flowLauncherPath');
  const [mediaMaxWidth, setMediaMaxWidth] = useAppSetting('mediaMaxWidth');

  return (
    <PanelLayout title="General Settings">
      <div className="px-3 py-1">
        <PanelHeading
          title={'General'}
          description={'Settings about all overline-zebar widgets.'}
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
        </div>
      </div>
    </PanelLayout>
  );
}
