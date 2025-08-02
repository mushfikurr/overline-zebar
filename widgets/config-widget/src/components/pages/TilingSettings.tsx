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
  const [autoTilingWebSocketUri, setAutoTilingWebSocketUri] = useAppSetting(
    'autoTilingWebSocketUri'
  );

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
            <FieldTitle>Auto Tiling WebSocket URI</FieldTitle>
            <FieldInput>
              <Input
                placeholder="e.g., ws://localhost:6123"
                value={autoTilingWebSocketUri}
                onChange={(e) => setAutoTilingWebSocketUri(e.target.value)}
              />
            </FieldInput>
            <FieldDescription>
              The WebSocket URI for the auto-tiling service. Only active when
              auto-tiling is enabled.
            </FieldDescription>
          </FormField>
        </div>
      </div>
    </PanelLayout>
  );
}
