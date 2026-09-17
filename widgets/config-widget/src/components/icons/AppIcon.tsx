import { LauncherCommand } from '@overline-zebar/config/src/types';
import { convertFileSrc } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';
import { DEFAULT_ICON_NAME, useLucideIcon } from './lucide-icons';

/**
 * Renders an application icon: the custom image file when one is set
 * (falling back to the Lucide icon if the file can't be loaded), otherwise
 * the selected Lucide icon. Occupies its full className box while loading.
 */
export function AppIcon({
  app,
  className,
  strokeWidth = 1.75,
}: {
  app: Pick<LauncherCommand, 'icon' | 'iconPath'>;
  className?: string;
  strokeWidth?: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const Icon = useLucideIcon(
    app.iconPath && !imageFailed ? undefined : app.icon
  );

  useEffect(() => setImageFailed(false), [app.iconPath]);

  if (app.iconPath && !imageFailed) {
    return (
      <img
        src={convertFileSrc(app.iconPath)}
        onError={() => setImageFailed(true)}
        className={className}
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
