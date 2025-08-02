import { PanelLayout } from '@overline-zebar/ui';
import PanelHeading from '../PanelHeading';
import { ThemeEditor } from '../theme/ThemeEditor';

type Props = {};

function AppearanceSettings({}: Props) {
  return (
    <PanelLayout title="Appearance">
      <div className="px-3 py-1">
        <PanelHeading
          title="Apperance"
          description="Customise your overline-zebar widgets to suit you."
        />
        <ThemeEditor />
      </div>
    </PanelLayout>
  );
}

export default AppearanceSettings;
