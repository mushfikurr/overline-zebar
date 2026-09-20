import { resolveIconBackground } from '../../utils/icon-backgrounds';
import { Folder } from 'lucide-react';
import { cn } from '../../utils/cn';

export function FolderSquare({
  className = '',
  glyphClassName = 'size-5',
}: {
  className?: string;
  glyphClassName?: string;
}) {
  const { background, iconColor } = resolveIconBackground(undefined);

  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-[22%] shadow-icon-tile',
        className
      )}
      style={{ background, color: iconColor }}
    >
      <Folder className={glyphClassName} strokeWidth={1.75} />
    </span>
  );
}
