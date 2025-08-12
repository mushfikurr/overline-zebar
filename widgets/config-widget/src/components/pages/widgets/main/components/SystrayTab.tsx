import { useWidgetSetting } from '@overline-zebar/config';
import { Switch } from '@overline-zebar/ui';
import { useEffect, useMemo, useState } from 'react';
import * as zebar from 'zebar';

const providers = zebar.createProviderGroup({
  systray: { type: 'systray' },
});

function SystrayTab() {
  const [output, setOutput] = useState(providers.outputMap);
  const [pinnedSystrayIcons, setPinnedSystrayIcons] = useWidgetSetting(
    'main',
    'pinnedSystrayIcons'
  );

  useEffect(() => {
    providers.onOutput(() => setOutput(providers.outputMap));
  }, []);

  const icons = useMemo(() => output.systray?.icons, [output.systray]);

  const isIconPinned = (icon: zebar.SystrayIcon) => {
    return !!pinnedSystrayIcons.find((i: string) => icon.iconHash === i);
  };

  const handleCheckedChange = (toPin: zebar.SystrayIcon) => {
    if (isIconPinned(toPin)) {
      setPinnedSystrayIcons(
        pinnedSystrayIcons.filter((i: string) => i !== toPin.iconHash)
      );
    } else {
      setPinnedSystrayIcons([...pinnedSystrayIcons, toPin.iconHash]);
    }
  };

  return (
    <>
      <div className="space-y-0.5">
        <h1>Pinned Icons</h1>
        <p className="text-text-muted">
          These icons will stay visible in your system tray when it is
          collapsed.
        </p>
        <p className="text-text-muted">
          You can Shift + Click the system tray icons in the topbar to toggle
          between expanded or collapsed.
        </p>
      </div>
      <div className="grow grid grid-cols-2 gap-y-3 gap-x-6">
        {icons?.map((i) => (
          <div key={i.iconHash} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img className="h-6 w-6" src={i.iconUrl} />
              <p>{i.tooltip}</p>
            </div>
            <Switch
              checked={isIconPinned(i)}
              onCheckedChange={() => handleCheckedChange(i)}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export default SystrayTab;
