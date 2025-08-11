import {
  FieldDescription,
  FieldInput,
  FieldTitle,
  FormField,
  Switch,
} from '@overline-zebar/ui';
import WeatherThresholds from './WeatherThresholds';
import { useWidgetSetting } from '@overline-zebar/config';

export default function WeatherTab() {
  const [weatherUnit, setWeatherUnit] = useWidgetSetting('main', 'weatherUnit');

  return (
    <>
      <FormField switch>
        <FieldTitle>Toggle Farenheit</FieldTitle>
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
            Defines the points at which specific colors are displayed for each
            range.
          </p>
        </div>
        <WeatherThresholds />
      </div>
    </>
  );
}
