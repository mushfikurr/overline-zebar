import { type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function BackgroundSwatch({
  title,
  selected,
  onSelect,
  style,
  className = '',
  children,
}: {
  title: string;
  selected: boolean;
  onSelect: () => void;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={selected}
      onClick={onSelect}
      style={style}
      className={cn(
        'flex size-5 items-center justify-center rounded-[22%] outline-none transition-[box-shadow,transform] duration-150 ease-out focus-visible:ring-[3px] focus-visible:ring-primary/50 active:scale-95',
        selected
          ? 'ring-primary-border ring-offset-surface ring-2 ring-offset-1'
          : 'hover:scale-105',
        className
      )}
    >
      {children}
    </button>
  );
}
