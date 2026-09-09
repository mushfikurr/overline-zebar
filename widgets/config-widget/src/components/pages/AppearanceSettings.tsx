import {
  FieldDescription,
  FieldInput,
  FieldTitle,
  FormField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@overline-zebar/ui';
import { useAppSetting } from '@overline-zebar/config';
import SettingsPage from '../SettingsPage';
import { ThemePicker } from '../theme/ThemePicker';
import { Separator } from '../common/Separator';
import FontPicker from '../common/FontPicker';

function AppearanceSettings() {
  const [radius, setRadius] = useAppSetting('radius');
  const [windowEffect, setWindowEffect] = useAppSetting('windowEffect');

  const radiusOptions = [
    { label: 'None', value: '0rem' },
    { label: 'Small', value: '0.25rem' },
    { label: 'Medium', value: '0.5rem' },
    { label: 'Large', value: '0.75rem' },
    { label: 'X-Large', value: '1rem' },
  ];

  const effectOptions = [
    { label: 'Acrylic', value: 'acrylic' },
    { label: 'Blur', value: 'blur' },
    { label: 'Mica', value: 'mica' },
    { label: 'None', value: 'none' },
  ];

  return (
    <SettingsPage
      title="Appearance"
      description="Customise your overline-zebar widgets to suit you."
    >
      <div>
        <FormField>
          <FieldTitle>Border Radius</FieldTitle>
          <FieldInput>
            <Select
              onValueChange={(value) => setRadius(value as string)}
              defaultValue={radius}
              items={radiusOptions}
            >
              <SelectTrigger>
                <SelectValue>
                  {(value: string) => {
                    const option = radiusOptions.find(
                      (opt) => opt.value === value
                    );
                    return option ? option.label : '';
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {radiusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldInput>
          <FieldDescription>
            Changes how "rounded" elements are.
          </FieldDescription>
        </FormField>
        <Separator />
        <FormField>
          <FieldTitle>Window Effect</FieldTitle>
          <FieldInput>
            <Select
              onValueChange={(value) => setWindowEffect(value as string)}
              defaultValue={windowEffect}
              items={effectOptions}
            >
              <SelectTrigger>
                <SelectValue>
                  {(value: string) => {
                    const option = effectOptions.find(
                      (opt) => opt.value === value
                    );
                    return option ? option.label : '';
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {effectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldInput>
          <FieldDescription>
            Sets the window transparency/blurring effect. Restart Zebar to
            ensure the correct effect is applied.
          </FieldDescription>
        </FormField>
        <Separator />
        <FormField>
          <FieldTitle>Font</FieldTitle>
          <FieldInput>
            <FontPicker />
          </FieldInput>
          <FieldDescription>
            Font used across all widgets. Defaults to Geist Mono.
          </FieldDescription>
        </FormField>
        <Separator />
        <FormField>
          <FieldTitle>Theme</FieldTitle>
          <FieldInput>
            <ThemePicker />
          </FieldInput>
        </FormField>
      </div>
    </SettingsPage>
  );
}

export default AppearanceSettings;
