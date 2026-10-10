import {
  FieldDescription,
  FieldInput,
  FieldTitle,
  FormField,
  Switch,
} from '@overline-zebar/ui';
import ThresholdsInput from './ThresholdsInput';
import { useWidgetSetting, ProviderSettings } from '@overline-zebar/config';
import { Separator } from '@/components/common/Separator';

const providerLabels: Record<keyof ProviderSettings, string> = {
  cpu: 'CPU Usage',
  memory: 'Memory Usage',
  weather: 'Weather',
  battery: 'Battery',
};

export default function SystemStatsTab() {
  const [providers, setProviders] = useWidgetSetting('main', 'providers');
  const [weatherUnit, setWeatherUnit] = useWidgetSetting('main', 'weatherUnit');
  const [useInlineStats, setUseInlineStats] = useWidgetSetting(
    'main',
    'useInlineStats'
  );
  const [systemStatThresholds, setSystemStatThresholds] = useWidgetSetting(
    'main',
    'systemStatThresholds'
  );
  const [batteryThresholds, setBatteryThresholds] = useWidgetSetting(
    'main',
    'batteryThresholds'
  );

  const handleProviderToggle = (
    provider: keyof ProviderSettings,
    checked: boolean
  ) => {
    setProviders({ ...providers, [provider]: checked });
  };

  return (
    <>
      {/* Provider Toggles */}
      <div>
        <div className="space-y-0.5 mb-4">
          <h1 className="text-text">Providers</h1>
          <p className="text-text-muted">
            Enable or disable individual system stat providers.
          </p>
        </div>
        <div className="space-y-6">
          {(Object.keys(providers) as Array<keyof ProviderSettings>).map(
            (key) => (
              <FormField switch key={key}>
                <FieldTitle>{providerLabels[key]}</FieldTitle>
                <FieldInput>
                  <Switch
                    checked={providers[key]}
                    onCheckedChange={(checked) =>
                      handleProviderToggle(key, checked)
                    }
                  />
                </FieldInput>
              </FormField>
            )
          )}
        </div>
      </div>

      {/* CPU & RAM Display Settings */}
      {(providers.cpu || providers.memory) && (
        <>
          <Separator />
          <div className="space-y-6">
            <div className="space-y-0.5 mb-4">
              <h1 className="text-text">CPU & RAM Display</h1>
              <p className="text-text-muted">
                Configure how system statistics are displayed.
              </p>
            </div>
            <FormField switch>
              <FieldTitle>Use Inline Stats</FieldTitle>
              <FieldInput>
                <Switch
                  checked={useInlineStats}
                  onCheckedChange={setUseInlineStats}
                />
              </FieldInput>
              <FieldDescription>
                Display CPU and RAM usage as inline text instead of ring
                visualization.
              </FieldDescription>
            </FormField>
            <div className="space-y-4">
              <div className="space-y-0.5">
                <h1 className="text-text">Thresholds</h1>
                <p className="text-text-muted">
                  Configure color ranges based on usage percentage.
                </p>
              </div>
              <ThresholdsInput
                thresholds={systemStatThresholds}
                onChange={setSystemStatThresholds}
              />
            </div>
          </div>
        </>
      )}

      {/* Divider */}
      <Separator />

      {/* Weather Specific Settings */}
      {providers.weather && (
        <div className="space-y-6">
          <h1 className="text-text-muted font-medium">Weather Settings</h1>
          <FormField switch>
            <FieldTitle>Toggle Fahrenheit</FieldTitle>
            <FieldInput>
              <Switch
                checked={weatherUnit === 'fahrenheit'}
                onCheckedChange={(checked) =>
                  setWeatherUnit(checked ? 'fahrenheit' : 'celsius')
                }
              />
            </FieldInput>
            <FieldDescription>
              Toggle to display weather temperatures in Fahrenheit or Celsius.
            </FieldDescription>
          </FormField>
          <div className="space-y-4">
            <div className="space-y-0.5">
              <h1 className="text-text">Thresholds</h1>
              <p className="text-text-muted">
                Defines the points at which specific colors are displayed for
                each range.
              </p>
            </div>
            <ThresholdsInput />
          </div>
        </div>
      )}

      {/* Battery Thresholds */}
      {providers.battery && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="space-y-0.5">
              <h1 className="text-text">Battery Thresholds</h1>
              <p className="text-text-muted">
                Configure color ranges based on battery percentage.
              </p>
            </div>
            <ThresholdsInput
              thresholds={batteryThresholds}
              onChange={setBatteryThresholds}
              settingKey="batteryThresholds"
            />
          </div>
        </>
      )}
    </>
  );
}
