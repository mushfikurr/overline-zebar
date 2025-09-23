import { useWidgetSetting } from '@overline-zebar/config';
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

const TIME_FORMATS = [
  { value: 'HH:mm', label: '24-hour (14:30)' },
  { value: 'HH:mm:ss', label: '24-hour with seconds (14:30:45)' },
  { value: 'h:mm a', label: '12-hour (2:30 PM)' },
  { value: 'h:mm:ss a', label: '12-hour with seconds (2:30:45 PM)' },
  { value: 'EEE HH:mm', label: 'Day + 24-hour (Mon 14:30)' },
  { value: 'EEE h:mm a', label: 'Day + 12-hour (Mon 2:30 PM)' },
  { value: 'd MMM HH:mm', label: 'Date + 24-hour (15 Jan 14:30)' },
  { value: 'MMM d, h:mm a', label: 'Date + 12-hour (Jan 15, 2:30 PM)' },
  { value: 'EEE d MMM t', label: 'Full (Mon 15 Jan 2:30 PM)' },
];

const TIME_LOCALES = [
  { value: 'en-GB', label: 'English (UK) - 24h' },
  { value: 'en-US', label: 'English (US) - 12h' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'it-IT', label: 'Italian' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
  { value: 'ru-RU', label: 'Russian' },
  { value: 'ar-SA', label: 'Arabic' },
];

function TimeTab() {
  const [timeFormat, setTimeFormat] = useWidgetSetting('main', 'timeFormat');
  const [timeLocale, setTimeLocale] = useWidgetSetting('main', 'timeLocale');

  return (
    <>
      <FormField>
        <FieldTitle>Time Format</FieldTitle>
        <FieldInput>
          <Select value={timeFormat} onValueChange={setTimeFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Select a time format" />
            </SelectTrigger>
            <SelectContent>
              {TIME_FORMATS.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldInput>
        <FieldDescription>
          Choose how you want the time to be displayed in the topbar.
        </FieldDescription>
      </FormField>

      <FormField>
        <FieldTitle>Time Locale</FieldTitle>
        <FieldInput>
          <Select value={timeLocale} onValueChange={setTimeLocale}>
            <SelectTrigger>
              <SelectValue placeholder="Select a locale" />
            </SelectTrigger>
            <SelectContent>
              {TIME_LOCALES.map((locale) => (
                <SelectItem key={locale.value} value={locale.value}>
                  {locale.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldInput>
        <FieldDescription>
          Select the locale for time formatting and regional conventions.
        </FieldDescription>
      </FormField>
    </>
  );
}

export default TimeTab;
