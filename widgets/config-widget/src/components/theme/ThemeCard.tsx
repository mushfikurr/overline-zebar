import { Theme } from '@overline-zebar/config';
import { Button } from '@overline-zebar/ui';
import { MoonIcon, PencilIcon, SunIcon, Trash2Icon } from 'lucide-react';
import { cn } from '@/utils/cn';

type ThemeColors = Theme['colors'];

/** T3-style preview ball: theme background with a soft accent glow. */
export function ThemePreviewCircle({
  colors,
  className,
}: {
  colors: ThemeColors;
  className?: string;
}) {
  const base = colors['--background'] ?? '#000000';
  const primary = colors['--primary'] ?? '#808080';
  const secondary = colors['--button'] ?? primary;

  return (
    <span
      aria-hidden
      className={cn(
        'border-border/70 relative block size-14 shrink-0 overflow-hidden rounded-full border shadow-sm',
        className
      )}
      style={{
        backgroundColor: base,
        backgroundImage: [
          `radial-gradient(circle at 68% 28%, ${primary} 0%, transparent 52%)`,
          `radial-gradient(circle at 25% 80%, ${secondary} 0%, transparent 45%)`,
        ].join(', '),
        boxShadow:
          'inset 0 0 0 1px rgb(128 128 128 / 0.3), 0 1px 2px rgb(0 0 0 / 0.2)',
      }}
    />
  );
}

interface ThemeCardProps {
  theme: Theme;
  /** Fixed mode: this theme is the active theme. */
  isActive: boolean;
  systemMode: boolean;
  ownsLight: boolean;
  ownsDark: boolean;
  onUse: () => void;
  onAssignLight: () => void;
  onAssignDark: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}

export function ThemeCard({
  theme,
  isActive,
  systemMode,
  ownsLight,
  ownsDark,
  onUse,
  onAssignLight,
  onAssignDark,
  onEdit,
  onRemove,
}: ThemeCardProps) {
  return (
    <div
      className={cn(
        'bg-surface/40 group cursor-pointer overflow-hidden rounded-lg border transition-colors hover:bg-surface/70',
        isActive && !systemMode
          ? 'border-primary shadow-[inset_0_0_0_1px] shadow-primary/60'
          : 'border-border hover:border-button-border'
      )}
      onClick={onUse}
    >
      <div className="relative flex items-center justify-center py-4">
        <button
          type="button"
          aria-pressed={systemMode ? ownsLight || ownsDark : isActive}
          aria-label={
            systemMode
              ? `Use ${theme.name} for the current Windows appearance`
              : `Use ${theme.name}`
          }
          className="cursor-pointer rounded-full outline-none transition-transform group-hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/50"
          onClick={(e) => {
            e.stopPropagation();
            onUse();
          }}
        >
          <ThemePreviewCircle colors={theme.colors} />
        </button>
        {systemMode && (
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              aria-pressed={ownsLight}
              title="Use for light mode"
              className={cn(
                'border-border flex size-5 cursor-pointer items-center justify-center rounded-full border bg-background/80 backdrop-blur-sm transition-colors',
                ownsLight && 'border-primary bg-primary/25 text-text'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onAssignLight();
              }}
            >
              <SunIcon className="text-text size-3" />
            </button>
            <button
              type="button"
              aria-pressed={ownsDark}
              title="Use for dark mode"
              className={cn(
                'border-border flex size-5 cursor-pointer items-center justify-center rounded-full border bg-background/80 backdrop-blur-sm transition-colors',
                ownsDark && 'border-primary bg-primary/25 text-text'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onAssignDark();
              }}
            >
              <MoonIcon className="text-text size-3" />
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 px-2.5 pb-2">
        <span className="text-text min-w-0 flex-1 truncate text-sm">
          {theme.name}
        </span>
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${theme.name}`}
            title="Edit theme"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <PencilIcon />
          </Button>
        )}
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Remove ${theme.name}`}
            title="Remove theme"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2Icon />
          </Button>
        )}
      </div>
    </div>
  );
}
