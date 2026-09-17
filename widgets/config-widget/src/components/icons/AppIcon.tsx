import { LauncherCommand } from '@overline-zebar/config/src/types';
import { convertFileSrc } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';
import { DEFAULT_ICON_NAME, useLucideIcon } from './lucide-icons';

/**
 * Renders an application icon: the inline data URL when one is set, then the
 * custom image file path (falling back to the Lucide icon if the file can't
 * be loaded), otherwise the selected Lucide icon. Occupies its full
 * className box while loading.
 */
export function AppIcon({
  app,
  className,
  strokeWidth = 1.75,
}: {
  app: Pick<LauncherCommand, 'icon' | 'iconPath' | 'iconData'>;
  className?: string;
  strokeWidth?: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const Icon = useLucideIcon(
    imageFailed || (!app.iconData && !app.iconPath) ? app.icon : undefined
  );

  useEffect(() => setImageFailed(false), [app.iconData, app.iconPath]);

  if (app.iconData && !imageFailed) {
    return (
      <img
        src={app.iconData}
        onError={() => setImageFailed(true)}
        className={`${className ?? ''} object-contain`}
        alt=""
      />
    );
  }

  if (app.iconPath && !imageFailed) {
    return (
      <img
        src={convertFileSrc(app.iconPath)}
        onError={() => setImageFailed(true)}
        className={`${className ?? ''} object-contain`}
        alt=""
      />
    );
  }

  return Icon ? (
    <Icon className={className} strokeWidth={strokeWidth} />
  ) : (
    <span className={className} aria-hidden data-icon={DEFAULT_ICON_NAME} />
  );
}
