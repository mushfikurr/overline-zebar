import { Separator } from '@/components/common/Separator';
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
  Switch,
} from '@overline-zebar/ui';

export function ApplicationsTab() {
  const [view, setView] = useWidgetSetting('script-launcher', 'view');
  const [showCommands, setShowCommands] = useWidgetSetting(
    'script-launcher',
    'showCommands'
  );
  const [collapsePaths, setCollapsePaths] = useWidgetSetting(
    'script-launcher',
    'collapsePaths'
  );

  return (
    <div className="space-y-8">
      <div>
        <FormField>
          <FieldTitle>Default view</FieldTitle>
          <FieldInput>
            <Select
              value={view ?? 'grid'}
              onValueChange={(value) => setView(value as 'grid' | 'list')}
            >
              <SelectTrigger className="w-28">
                <SelectValue>
                  {(value: string) => (value === 'list' ? 'List' : 'Grid')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
          </FieldInput>
          <FieldDescription>Layout the launcher opens with.</FieldDescription>
        </FormField>
        <Separator />
        <FormField switch>
          <FieldTitle>Show commands</FieldTitle>
          <FieldInput>
            <Switch checked={showCommands} onCheckedChange={setShowCommands} />
          </FieldInput>
          <FieldDescription>
            Show each entry's command in list view.
          </FieldDescription>
        </FormField>
        {showCommands && (
          <>
            <Separator />
            <FormField switch>
              <FieldTitle>Collapse paths</FieldTitle>
              <FieldInput>
                <Switch
                  checked={collapsePaths}
                  onCheckedChange={setCollapsePaths}
                />
              </FieldInput>
              <FieldDescription>
                When an entry is a path, show only its last segment instead of
                the full path, e.g. C:/tools/app.exe shows as app.exe. Other
                commands are unaffected.
              </FieldDescription>
            </FormField>
          </>
        )}
      </div>
    </div>
  );
}
