import { useAppSetting } from '@overline-zebar/config';
import {
  AppFormField,
  FieldDescription,
  FieldInput,
  FieldTitle,
  Input,
  Switch,
} from '@overline-zebar/ui';
import SettingsPage from '../SettingsPage';
import { Separator } from '../common/Separator';

export function GeneralSettings() {
  const [useAutoTiling, setUseAutoTiling] = useAppSetting('useAutoTiling');
  const [websocketUri, setWebsocketUri] = useAppSetting('zebarWebsocketUri');

  return (
    <SettingsPage
      title={'General'}
      description={'Settings about all overline-zebar widgets.'}
    >
      <div>
        <AppFormField switch setting="useAutoTiling">
          <FieldTitle>Enable Auto Tiling</FieldTitle>
          <FieldInput>
            <Switch
              checked={useAutoTiling}
              onCheckedChange={setUseAutoTiling}
            />
          </FieldInput>
          <FieldDescription>
            Will automatically change the tiling direction when the window size
            becomes less than half.
          </FieldDescription>
        </AppFormField>
        <Separator />
        <AppFormField setting="zebarWebsocketUri">
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
        </AppFormField>
      </div>
    </SettingsPage>
  );
}
