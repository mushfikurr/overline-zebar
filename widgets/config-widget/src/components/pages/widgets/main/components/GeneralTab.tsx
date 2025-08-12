import { useState } from 'react';
import { NumberInput } from '@/components/NumberInput';
import { useWidgetSetting } from '@overline-zebar/config';
import {
  FieldDescription,
  FieldInput,
  FieldTitle,
  FormField,
  Input,
  Switch,
  Button, // Added Button import
} from '@overline-zebar/ui';

function GeneralTab() {
  const [mediaMaxWidth, setMediaMaxWidth] = useWidgetSetting(
    'main',
    'mediaMaxWidth'
  );
  const [flowLauncherPath, setFlowLauncherPath] = useWidgetSetting(
    'main',
    'flowLauncherPath'
  );
  const [marginX, setMarginX] = useWidgetSetting('main', 'marginX');
  const [paddingLeft, setPaddingLeft] = useWidgetSetting('main', 'paddingLeft');
  const [paddingRight, setPaddingRight] = useWidgetSetting(
    'main',
    'paddingRight'
  );
  const [isPaddingLinked, setIsPaddingLinked] = useState(
    paddingLeft === paddingRight
  );
  const [dynamicWorkspaceIndicator, setDynamicWorkspaceIndicator] =
    useWidgetSetting('main', 'dynamicWorkspaceIndicator');

  const handleLinkedPaddingChange = (value: number) => {
    setPaddingLeft(value);
    setPaddingRight(value);
  };

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
      <FormField switch>
        <FieldTitle>Allow Dynamic Workspace Indicators</FieldTitle>
        <FieldInput>
          <Switch
            checked={dynamicWorkspaceIndicator}
            onCheckedChange={setDynamicWorkspaceIndicator}
          />
        </FieldInput>
        <FieldDescription>
          Allow workspace indicators to be named after the first opened window.
        </FieldDescription>
      </FormField>
      <FormField>
        <FieldTitle>Horizontal Margin</FieldTitle>
        <FieldInput>
          <NumberInput value={marginX} onChange={setMarginX} min={0} />
        </FieldInput>
        <FieldDescription>
          Sets the outside space (left and right). Good for a "floating"
          appearance.
        </FieldDescription>
      </FormField>
      <FormField>
        <FieldTitle>Horizontal Padding</FieldTitle>
        <FieldInput className="flex items-center gap-3">
          {isPaddingLinked ? (
            <NumberInput
              value={paddingLeft}
              onChange={handleLinkedPaddingChange}
              min={0}
              className="flex-grow"
            />
          ) : (
            <>
              <NumberInput
                value={paddingLeft}
                onChange={setPaddingLeft}
                min={0}
                className="flex-grow"
              />
              <NumberInput
                value={paddingRight}
                onChange={setPaddingRight}
                min={0}
                className="flex-grow"
              />
            </>
          )}
          <Button onClick={() => setIsPaddingLinked(!isPaddingLinked)}>
            {isPaddingLinked ? 'Unlink' : 'Link'}
          </Button>
        </FieldInput>
        <FieldDescription>
          Sets the inner space (left and right).
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
