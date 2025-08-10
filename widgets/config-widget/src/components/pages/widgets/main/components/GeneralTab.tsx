import { useWidgetSetting } from '@overline-zebar/config';
import {
  FieldDescription,
  FieldInput,
  FieldTitle,
  FormField,
  Input,
} from '@overline-zebar/ui';

type Props = {};

function GeneralTab({}: Props) {
  const [mediaMaxWidth, setMediaMaxWidth] = useWidgetSetting('main', 'mediaMaxWidth');
  const [flowLauncherPath, setFlowLauncherPath] =
    useWidgetSetting('main', 'flowLauncherPath');

  return (
    <>
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
          Specify the full path to your Launcher executable (the search button,
          leftmost of the topbar widget).
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
    </>
  );
}

export default GeneralTab;
