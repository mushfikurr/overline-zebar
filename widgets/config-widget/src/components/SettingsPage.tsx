import { ReactNode } from 'react';
import { PanelLayout } from '@overline-zebar/ui';
import PanelHeading from './PanelHeading';

type SettingsPageProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function SettingsPage({ title, description, children }: SettingsPageProps) {
  return (
    <PanelLayout>
      <PanelHeading title={title} description={description} />
      <div className="px-4 py-4">{children}</div>
    </PanelLayout>
  );
}

export default SettingsPage;
