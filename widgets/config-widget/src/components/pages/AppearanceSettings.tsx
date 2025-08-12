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

function AppearanceSettings() {
  const [radius, setRadius] = useAppSetting('radius');
  return (
    <PanelLayout title="Appearance">
      <div className="px-3 py-1 flex-grow flex flex-col">
        <PanelHeading
          title="Apperance"
          description="Customise your overline-zebar widgets to suit you."
        />
        <div className="space-y-8 h-full">
          <FormField>
            <FieldTitle>Border Radius</FieldTitle>
            <FieldInput>
              <Select
                onValueChange={(value) => setRadius(value as any)}
                defaultValue={radius}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0rem">None</SelectItem>
                  <SelectItem value="0.25rem">Small</SelectItem>
                  <SelectItem value="0.5rem">Medium</SelectItem>
                  <SelectItem value="0.75rem">Large</SelectItem>
                  <SelectItem value="1rem">X-Large</SelectItem>
                </SelectContent>
              </Select>
            </FieldInput>
            <FieldDescription>
              Changes how "rounded" elements are.
            </FieldDescription>
          </FormField>

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
