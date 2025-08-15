import {
  FieldDescription,
  FieldInput,
  FieldTitle,
  FormField,
  Switch,
} from '@overline-zebar/ui';
import WeatherThresholds from './WeatherThresholds';
import { useWidgetSetting, ProviderSettings } from '@overline-zebar/config';

export default function SystemStatsTab() {
  const [providers, setProviders] = useWidgetSetting('main', 'providers');
  const [weatherUnit, setWeatherUnit] = useWidgetSetting('main', 'weatherUnit');

  const handleProviderToggle = (
    provider: keyof ProviderSettings,
    checked: boolean
  ) => {
    setProviders({ ...providers, [provider]: checked });
  };

  return (
    <>
      {/* Provider Toggles */}
      <div className="space-y-4">
        <div className="space-y-0.5">
          <h1 className="text-text">Providers</h1>
          <p className="text-text-muted">
            Enable or disable individual system stat providers.
          </p>
        </div>
        <FormField switch>
          <FieldTitle>CPU Usage</FieldTitle>
          <FieldInput>
            <Switch
              checked={providers.cpu}
              onCheckedChange={(checked) =>
                handleProviderToggle('cpu', checked)
              }
            />
          </FieldInput>
        </FormField>
        <FormField switch>
          <FieldTitle>Memory Usage</FieldTitle>
          <FieldInput>
            <Switch
              checked={providers.memory}
              onCheckedChange={(checked) =>
                handleProviderToggle('memory', checked)
              }
            />
          </FieldInput>
        </FormField>
        <FormField switch>
          <FieldTitle>Weather</FieldTitle>
          <FieldInput>
            <Switch
              checked={providers.weather}
              onCheckedChange={(checked) =>
                handleProviderToggle('weather', checked)
              }
            />
          </FieldInput>
        </FormField>
      </div>

      {/* Divider */}
      <div className="w-full bg-text/5 h-px my-6"></div>

      {/* Weather Specific Settings */}
      {providers.weather && (
        <div className="space-y-4">
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
            <WeatherThresholds />
          </div>
        </div>
      )}
    </>
  );
}
