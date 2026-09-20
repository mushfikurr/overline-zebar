import { LauncherCommand } from '@overline-zebar/config';
import { resolveIconBackground } from '../../utils/icon-backgrounds';
import { cn } from '../../utils/cn';
import { AppIcon } from './AppIcon';

export function IconSquare({
  app,
  className = '',
  glyphClassName,
  strokeWidth,
}: {
  app: Pick<LauncherCommand, 'icon' | 'iconPath' | 'iconData' | 'iconColor'>;
  className?: string;
  glyphClassName?: string;
  strokeWidth?: number;
}) {
  const { background, iconColor } = resolveIconBackground(app.iconColor);

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-[22%]',
        background && 'shadow-icon-tile',
        className
      )}
      style={{ background, color: iconColor }}
    >
      <AppIcon app={app} className={glyphClassName} strokeWidth={strokeWidth} />
    </span>
  );
}
