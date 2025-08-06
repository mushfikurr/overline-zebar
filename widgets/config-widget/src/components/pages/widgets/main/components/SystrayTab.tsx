import { useAppSetting } from '@overline-zebar/config';
import { Switch } from '@overline-zebar/ui';
import { useEffect, useMemo, useState } from 'react';
import * as zebar from 'zebar';

type Props = {};

const providers = zebar.createProviderGroup({
  systray: { type: 'systray' },
});

function SystrayTab({}: Props) {
  const [output, setOutput] = useState(providers.outputMap);
  const [pinnedSystrayIcons, setPinnedSystrayIcons] =
    useAppSetting('pinnedSystrayIcons');

  useEffect(() => {
    providers.onOutput(() => setOutput(providers.outputMap));
  }, []);

  const icons = useMemo(() => output.systray?.icons, [output.systray]);

  const isIconPinned = (icon: zebar.SystrayIcon) => {
    return !!pinnedSystrayIcons.find((i) => icon.iconHash === i.iconHash);
  };

  const handleCheckedChange = (toPin: zebar.SystrayIcon) => {
    if (isIconPinned(toPin)) {
      setPinnedSystrayIcons(
        pinnedSystrayIcons.filter((i) => i.iconHash !== toPin.iconHash)
      );
    } else {
      setPinnedSystrayIcons([...pinnedSystrayIcons, toPin]);
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
      <div className="space-y-4">
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
