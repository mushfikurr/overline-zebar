import { LauncherCommand, resolveIconBackground } from '@overline-zebar/config';
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
        background &&
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.1)]',
        className
      )}
      style={{ background, color: iconColor }}
    >
      <AppIcon app={app} className={glyphClassName} strokeWidth={strokeWidth} />
    </span>
  );
}
