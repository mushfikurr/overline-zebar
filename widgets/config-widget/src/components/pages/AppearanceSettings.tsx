import {
  FieldDescription,
  FieldInput,
  FieldTitle,
  FormField,
  PanelLayout,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@overline-zebar/ui';
import { useAppSetting } from '@overline-zebar/config';
import PanelHeading from '../PanelHeading';
import { ThemeEditor } from '../theme/ThemeEditor';
import { Separator } from '../common/Separator';

function AppearanceSettings() {
  const [radius, setRadius] = useAppSetting('radius');

  const selectOptions = [
    { label: 'None', value: '0rem' },
    { label: 'Small', value: '0.25rem' },
    { label: 'Medium', value: '0.5rem' },
    { label: 'Large', value: '0.75rem' },
    { label: 'X-Large', value: '1rem' },
  ];

  return (
    <PanelLayout title="Appearance">
      <div className="px-3 py-1 flex-grow flex flex-col">
        <PanelHeading
          title="Apperance"
          description="Customise your overline-zebar widgets to suit you."
        />
        <div className="h-full">
          <FormField>
            <FieldTitle>Border Radius</FieldTitle>
            <FieldInput>
              <Select
                onValueChange={setRadius}
                defaultValue={radius}
                items={selectOptions}
              >
                <SelectTrigger>
                  <SelectValue>
                    {(value: string) => {
                      const option = selectOptions.find(
                        (opt) => opt.value === value
                      );
                      return option ? option.label : '';
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {selectOptions.map((option) => (
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
            <FieldTitle>Theme</FieldTitle>
            <FieldInput>
              <ThemeEditor />
            </FieldInput>
          </FormField>
        </div>
      </div>
    </PanelLayout>
  );
}

export default AppearanceSettings;
