import { LauncherCommand } from '@overline-zebar/config/src/types';
import { resolveIconBackground } from '@overline-zebar/config/src/utils/icon-backgrounds';
import { cn } from '../../utils/cn';
import { AppIcon } from './AppIcon';

/**
 * Raycast-style square rendered behind an application icon: a subtle
 * two-stop gradient with a soft sheen and hairline edge so it seats nicely
 * on light and dark themes. The glyph keeps its own size inside the square;
 * pick both with `className` (square) and `glyphClassName` (icon).
 *
 * Colour comes from `app.iconColor`: a preset id, 'none' to disable the
 * square, or undefined for the theme-primary default.
 */
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
