import { useManageRootConfig } from '@overline-zebar/config';
import {
  Button,
  FieldDescription,
  FieldInput,
  FieldTitle,
  FormField,
  Input,
  PanelLayout,
} from '@overline-zebar/ui';
import { useState } from 'react';
import PanelHeading from '../PanelHeading';

export function ConfigManagement() {
  const { resetConfig, importConfig, exportConfig } = useManageRootConfig();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleDownload = () => {
    const configJson = exportConfig();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'overline-zebar-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFeedback(null);
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const result = importConfig(content);
          if (result.success) {
            setFeedback({
              type: 'success',
              message: 'Configuration imported successfully!',
            });
          } else {
            setFeedback({
              type: 'error',
              message: `Failed to import configuration: ${result.error?.message}`,
            });
          }
        } catch (error: unknown) {
          setFeedback({
            type: 'error',
            message: `Failed to read file: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <PanelLayout title="Config Management">
      <div className="px-3 py-1 flex-grow flex flex-col">
        <PanelHeading
          title={'Config Management'}
          description={'Manage overline-zebar configuration.'}
        />
        <div className="space-y-8 pb-1">
          {feedback && (
            <div
              className={`px-3 py-1.5 rounded-md  border border-border ${feedback.type === 'success' ? 'bg-background' : 'bg-danger'}`}
            >
              {feedback.message}
            </div>
          )}
          <FormField>
            <FieldTitle>Export Configuration</FieldTitle>
            <FieldInput>
              <Button onClick={handleDownload}>Download Config</Button>
            </FieldInput>
          </FormField>

          <FormField>
            <FieldTitle>Import Configuration</FieldTitle>
            <FieldInput>
              <Input type="file" accept=".json" onChange={handleFileChange} />
            </FieldInput>
            <FieldDescription>
              Select a JSON file to import your configuration.
            </FieldDescription>
          </FormField>

          <FormField>
            <FieldTitle>Reset Configuration</FieldTitle>
            <FieldInput>
              <Button onClick={resetConfig}>Reset Config</Button>
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
