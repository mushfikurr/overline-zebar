import { resolveIconBackground } from '@overline-zebar/config';
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
        'flex shrink-0 items-center justify-center rounded-[22%] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.1)]',
        className
      )}
      style={{ background, color: iconColor }}
    >
      <Folder className={glyphClassName} strokeWidth={1.75} />
    </span>
  );
}
