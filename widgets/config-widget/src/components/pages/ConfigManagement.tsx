import { useResetRootConfig } from '@overline-zebar/config';
import {
  Button,
  FieldDescription,
  FieldInput,
  FieldTitle,
  FormField,
  PanelLayout,
} from '@overline-zebar/ui';
import PanelHeading from '../PanelHeading';

export function ConfigManagement() {
  const reset = useResetRootConfig();

  return (
    <PanelLayout title="Config Management">
      <div className="px-3 py-1 flex-grow flex flex-col">
        <PanelHeading
          title={'Config Management'}
          description={'Manage overline-zebar configuration.'}
        />
        <div className="space-y-8">
          <FormField>
            <FieldTitle>Reset Configuration</FieldTitle>
            <FieldInput>
              <Button onClick={reset}>Reset Config</Button>
            </FieldInput>
            <FieldDescription warning>
              This will reset all settings to their default values. This action
              is irreversible.
            </FieldDescription>
          </FormField>
        </div>
      </div>
    </PanelLayout>
  );
}

