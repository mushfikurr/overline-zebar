import { convertFileSrc } from '@tauri-apps/api/core';
import {
  Button,
  Input,
  Popover,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from '@overline-zebar/ui';
import { Image, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { searchLucideIcons, useLucideIcon } from './lucide-icons';

const BATCH_SIZE = 96;

export interface IconPickerValue {
  icon?: string;
  iconPath?: string;
}

interface IconPickerProps {
  value: IconPickerValue;
  onChange: (value: IconPickerValue) => void;
}

function CustomIconPreview({ path }: { path: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [path]);

  if (failed) {
    return (
      <span className="border-danger text-danger flex size-6 items-center justify-center rounded border border-dashed">
        <X className="size-3.5" />
      </span>
    );
  }

  return (
    <img
      src={convertFileSrc(path)}
      onError={() => setFailed(true)}
      className="size-6 rounded object-contain outline outline-1 outline-white/10"
      alt=""
    />
  );
}

function GridIcon({
  name,
  selected,
  onSelect,
}: {
  name: string;
  selected: boolean;
  onSelect: (name: string) => void;
}) {
  const Icon = useLucideIcon(name);

  return (
    <button
      type="button"
      title={name}
      aria-label={name}
      aria-pressed={selected}
      onClick={() => onSelect(name)}
      className={`flex size-8 items-center justify-center rounded-md outline-none transition-[background-color,color,box-shadow] duration-150 ease-out focus-visible:ring-primary/50 focus-visible:ring-[3px] active:scale-[0.96] ${
        selected
          ? 'bg-primary/25 text-text ring-1 ring-primary-border'
          : 'text-text-muted hover:bg-button hover:text-text'
      }`}
    >
      {Icon ? (
        <Icon className="size-4" strokeWidth={1.75} />
      ) : (
        <span className="bg-button size-4 animate-pulse rounded-sm" />
      )}
    </button>
  );
}

/**
 * WYSIWYG icon picker: searchable grid over every Lucide icon (lazy-loaded
 * per icon), plus an optional custom image file path.
 */
export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const names = useMemo(() => searchLucideIcons(query), [query]);
  const visibleNames = names.slice(0, visibleCount);

  const selectLucide = (name: string) =>
    onChange({ icon: name, iconPath: undefined });

  // Reveal icon batches as the grid is scrolled.
  useEffect(() => {
    if (!open) return;
    const sentinel = sentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) => count + BATCH_SIZE);
        }
      },
      { root, rootMargin: '64px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [open]);

  // Reset paging and scroll whenever the query or open state changes.
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [query, open]);

  const hasCustom = !!value.iconPath;
  const selectedName = hasCustom ? undefined : value.icon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={(props) => (
          <Button {...props} variant="outline" className="shrink-0">
            {hasCustom ? (
              <CustomIconPreview path={value.iconPath!} />
            ) : (
              <SelectedLucideIcon name={selectedName} />
            )}
            <span className="max-w-24 truncate">
              {hasCustom ? 'Custom' : (selectedName ?? 'Default')}
            </span>
          </Button>
        )}
      />
      <PopoverPortal>
        <PopoverPositioner align="start" sideOffset={4}>
          <PopoverPopup className="flex max-h-[var(--available-height)] w-80 max-w-[calc(100vw-1rem)] flex-col gap-2 p-2">
            <div className="flex items-center gap-2">
              <Input
                leadingIcon={<Search />}
                placeholder="Search icons..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                title="Reset to default icon"
                aria-label="Reset to default icon"
                onClick={() =>
                  onChange({ icon: undefined, iconPath: undefined })
                }
              >
                <X />
              </Button>
            </div>

            <div
              ref={scrollRef}
              className="border-border bg-background-deeper min-h-0 max-h-64 flex-1 overflow-y-auto rounded-md border p-1"
            >
              {names.length === 0 ? (
                <p className="text-text-muted p-4 text-center text-sm">
                  No icons match “{query}”.
                </p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] gap-1">
                  {visibleNames.map((name) => (
                    <GridIcon
                      key={name}
                      name={name}
                      selected={name === selectedName}
                      onSelect={selectLucide}
                    />
                  ))}
                </div>
              )}
              <div ref={sentinelRef} style={{ height: 1 }} />
            </div>

            <div className="flex items-center gap-2">
              <span
                className="text-text-muted shrink-0 [&_svg:not([class*='size-'])]:size-4"
                aria-hidden
              >
                <Image />
              </span>
              <Input
                value={value.iconPath ?? ''}
                onChange={(e) =>
                  onChange({
                    icon: undefined,
                    iconPath: e.target.value || undefined,
                  })
                }
                placeholder="Custom image path (.svg/.png/.ico)"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  );
}

function SelectedLucideIcon({ name }: { name?: string }) {
  const Icon = useLucideIcon(name);
  if (!Icon) return null;
  return <Icon className="size-4" strokeWidth={1.75} />;
}
