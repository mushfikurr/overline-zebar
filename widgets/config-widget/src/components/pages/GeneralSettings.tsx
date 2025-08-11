import {
  FieldDescription,
  FieldInput,
  FieldTitle,
  FormField,
  Input,
  PanelLayout,
  Switch,
} from '@overline-zebar/ui';
import PanelHeading from '../PanelHeading';
import { useAppSetting, useWidgetSetting } from '@overline-zebar/config';
import { NumberInput } from '../NumberInput';

export function GeneralSettings() {
  const [useAutoTiling, setUseAutoTiling] = useAppSetting('useAutoTiling');
  const [websocketUri, setWebsocketUri] = useAppSetting('zebarWebsocketUri');
  const [marginX, setMarginX] = useWidgetSetting('main', 'marginX');
  const [paddingX, setPaddingX] = useWidgetSetting('main', 'paddingX');

  return (
    <PanelLayout title="General Settings">
      <div className="px-3 py-1 flex-grow flex flex-col">
        <PanelHeading
          title={'General'}
          description={'Settings about all overline-zebar widgets.'}
        />
        <div className="space-y-8">
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
            <FieldInput>
              <NumberInput value={paddingX} onChange={setPaddingX} min={0} />
            </FieldInput>
            <FieldDescription>
              Sets the inner space (left and right).
            </FieldDescription>
          </FormField>
          <FormField switch>
            <FieldTitle>Enable Auto Tiling</FieldTitle>
            <FieldInput>
              <Switch
                checked={useAutoTiling}
                onCheckedChange={setUseAutoTiling}
              />
            </FieldInput>
            <FieldDescription>
              Will automatically change the tiling direction when the window
              size becomes less than half.
            </FieldDescription>
          </FormField>
          <FormField>
            <FieldTitle>Zebar WebSocket URI</FieldTitle>
            <FieldInput>
              <Input
                placeholder="e.g., ws://localhost:6123"
                value={websocketUri}
                onChange={(e) => setWebsocketUri(e.target.value)}
              />
            </FieldInput>
            <FieldDescription warning>
              This is the WebSocket URI for the Zebar service. By default Zebar
              runs on ws://localhost:6123.
            </FieldDescription>
          </FormField>
        </div>
      </div>
    </PanelLayout>
  );
}
