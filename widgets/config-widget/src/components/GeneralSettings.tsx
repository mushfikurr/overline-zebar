import {
  PanelLayout,
  Input,
  FormField,
  FieldTitle,
  FieldInput,
  FieldDescription,
} from '@overline-zebar/ui';
import { useAppSetting } from '@overline-zebar/config';

export function GeneralSettings() {
  const [flowLauncherPath, setFlowLauncherPath] =
    useAppSetting('flowLauncherPath');
  const [mediaMaxWidth, setMediaMaxWidth] = useAppSetting('mediaMaxWidth');

  return (
    <PanelLayout title="General Settings">
      <div className="px-3 py-1">
        <div>
          <h1 className="text-lg">Application Settings</h1>
          <p className="text-text-muted">
            Configure general application behavior.
          </p>
        </div>
        <div className="w-full bg-text/10 h-px my-4"></div>
        <div className="space-y-8">
          <FormField>
            <FieldTitle>Flow Launcher Path</FieldTitle>
            <FieldInput>
              <Input
                placeholder="e.g., C:\Users\YourUser\AppData\Local\FlowLauncher\Flow.Launcher.exe"
                value={flowLauncherPath}
                onChange={(e) => setFlowLauncherPath(e.target.value)}
              />
            </FieldInput>
            <FieldDescription>
              Specify the full path to your Flow Launcher executable.
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
              Set the maximum width for media displayed in the widget.
            </FieldDescription>
          </FormField>
        </div>
      </div>
    </PanelLayout>
  );
}
