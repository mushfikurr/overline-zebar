import {
  PanelLayout,
  Switch,
  Input,
  FormField,
  FieldTitle,
  FieldInput,
  FieldDescription,
} from '@overline-zebar/ui';
import { useAppSetting } from '@overline-zebar/config';
import PanelHeading from '../PanelHeading';

export function TilingSettings() {
  const [useAutoTiling, setUseAutoTiling] = useAppSetting('useAutoTiling');
  const [websocketUri, setWebsocketUri] = useAppSetting('zebarWebsocketUri');

  return (
    <PanelLayout title="Tiling">
      <div className="px-3 py-1">
        <PanelHeading
          title={'Tiling Settings'}
          description={'Configure automatic tiling behaviours.'}
        />
        <div className="space-y-8">
          <FormField switch>
            <FieldTitle>Enable Auto Tiling</FieldTitle>
            <FieldInput>
              <Switch
                checked={useAutoTiling}
                onCheckedChange={setUseAutoTiling}
              />
            </FieldInput>
            <FieldDescription>
              Toggle to enable or disable automatic window tiling.
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
