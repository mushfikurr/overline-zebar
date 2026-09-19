import { convertFileSrc } from '@tauri-apps/api/core';
import {
  ICON_BACKGROUND_NONE,
  defaultIconBackground,
  iconBackgroundGradient,
  iconBackgroundPresets,
} from '@overline-zebar/config/src/utils/icon-backgrounds';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from '@overline-zebar/ui';
import { Image, Search, Slash, X } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { searchLucideIcons, useLucideIcon } from './lucide-icons';
import { IconSquare } from './IconSquare';
import { cn } from '../../utils/cn';
import { beginFileDialog, endFileDialog } from '../../utils/fileDialogGuard';

const BATCH_SIZE = 96;

/** Upper bound for picked icon files, so configs don't balloon. */
const MAX_ICON_BYTES = 512 * 1024;

const IMAGE_MIME_BY_EXTENSION: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  bmp: 'image/bmp',
  avif: 'image/avif',
};

const IMAGE_ACCEPT = Object.keys(IMAGE_MIME_BY_EXTENSION)
  .map((extension) => `.${extension}`)
  .join(',');

export interface IconPickerValue {
  icon?: string;
  iconPath?: string;
  iconData?: string;
  /** Background square: preset id, 'none', or undefined for theme primary. */
  iconColor?: string;
}

interface IconPickerProps {
  value: IconPickerValue;
  onChange: (value: IconPickerValue) => void;
}

function CustomIconPreview({
  path,
  className = 'size-6',
}: {
  path: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [path]);

  if (failed) {
    return (
      <span
        className={cn(
          'border-danger text-danger flex items-center justify-center rounded border border-dashed',
          className
        )}
      >
        <X className="size-3.5" />
      </span>
    );
  }

  return (
    <img
      src={convertFileSrc(path)}
      onError={() => setFailed(true)}
      className={cn(
        'rounded object-contain outline outline-1 outline-white/10',
        className
      )}
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

  // rounded-sm nests within 1px of concentric inside the rounded-lg
  // bordered container above (the ideal would be 5px at default radius).
  return (
    <button
      type="button"
      title={name}
      aria-label={name}
      aria-pressed={selected}
      onClick={() => onSelect(name)}
      className={`rounded-sm flex size-8 items-center justify-center outline-none transition-[background-color,color,box-shadow] duration-150 ease-out focus-visible:ring-primary/50 focus-visible:ring-[3px] active:scale-[0.96] ${
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

/** Reads an image file and inlines it as a data URL for config storage. */
async function readFileAsDataUrl(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mimeType =
    IMAGE_MIME_BY_EXTENSION[extension] ??
    (file.type || 'application/octet-stream');

  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return `data:${mimeType};base64,${btoa(binary)}`;
}

/**
 * WYSIWYG icon picker: searchable grid over every Lucide icon (lazy-loaded
 * per icon), plus a custom image picked via the file input (stored inline
 * as a data URL).
 */
export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [pickError, setPickError] = useState<string | null>(null);
  const [pickedName, setPickedName] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // Bumped by the ref callbacks below: the dialog portal mounts the grid
  // after this component's effects have run, so the scroll observer must
  // wait until both nodes are actually attached.
  const [gridMountCount, setGridMountCount] = useState(0);

  const attachScrollRef = useCallback((node: HTMLDivElement | null) => {
    scrollRef.current = node;
    setGridMountCount((count) => count + 1);
  }, []);

  const attachSentinelRef = useCallback((node: HTMLDivElement | null) => {
    sentinelRef.current = node;
    setGridMountCount((count) => count + 1);
  }, []);

  const names = useMemo(() => searchLucideIcons(query), [query]);
  const visibleNames = names.slice(0, visibleCount);

  const selectLucide = (name: string) =>
    onChange({
      ...value,
      icon: name,
      iconPath: undefined,
      iconData: undefined,
    });

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
  }, [open, gridMountCount]);

  // Reset paging and scroll whenever the query or open state changes.
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [query, open]);

  const hasData = !!value.iconData;
  const hasCustom = hasData || !!value.iconPath;
  const selectedName = hasCustom ? undefined : value.icon;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setPickError(null);

    if (!file) return;

    if (file.size > MAX_ICON_BYTES) {
      setPickError('Image is too large (max 512 KB).');
      return;
    }

    try {
      const iconData = await readFileAsDataUrl(file);
      setPickedName(file.name);
      onChange({ ...value, icon: undefined, iconPath: undefined, iconData });
      setOpen(false);
    } catch {
      setPickedName(null);
      setPickError('Failed to read the image file.');
    }
  };

  // Opening the native dialog steals OS focus from the widget window, so
  // flag it to let blur-to-close widgets ignore the resulting blur. The
  // webview regains focus (and `change` fires) once the dialog closes,
  // whether a file was picked or it was cancelled.
  const handleFileInputClick = (event: MouseEvent<HTMLInputElement>) => {
    const input = event.currentTarget;

    beginFileDialog();

    const release = () => {
      endFileDialog();
      window.removeEventListener('focus', release);
      input.removeEventListener('change', release);
    };
    window.addEventListener('focus', release);
    input.addEventListener('change', release);
  };

  return (
    <>
      {/* p-1 with a -ml-px nudge gives the icon an even 4px gutter, and
      rounded-lg - 4px = rounded-sm keeps its curve exactly concentric
      (custom images add a 1px outline, which stays concentric too). */}
      <Button
        variant="outline"
        className="shrink-0 rounded-lg p-1 pr-2.5"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <span className="-ml-px flex size-5 shrink-0 items-center justify-center">
          {hasData ? (
            <img
              src={value.iconData}
              className="rounded-sm size-5 object-contain outline outline-1 outline-white/10"
              alt=""
            />
          ) : hasCustom ? (
            <CustomIconPreview
              path={value.iconPath!}
              className="rounded-sm size-5"
            />
          ) : (
            <IconSquare
              app={value}
              className="rounded-sm size-5"
              glyphClassName="size-3.5"
            />
          )}
        </span>
        <span className="max-w-24 truncate">
          {hasCustom ? 'Custom' : (selectedName ?? 'Default')}
        </span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden [@media(max-height:39.99rem)]:gap-3 [@media(max-height:39.99rem)]:p-4">
          <DialogHeader className="shrink-0">
            <DialogTitle>Choose icon</DialogTitle>
            <DialogDescription className="[@media(max-height:39.99rem)]:hidden">
              Pick a Lucide icon, or use a custom image.
            </DialogDescription>
          </DialogHeader>

          {/* Scrolls when the viewport is short; the grid itself keeps a
          fixed height so it always shows a usable number of icons. The
          padding run-out keeps the swatches clear of the scroll edge. */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 pb-1 [@media(max-height:39.99rem)]:gap-3">
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText>
                    <Search />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  className="px-2"
                  placeholder="Search icons..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  autoFocus
                />
                {query && (
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label="Clear search"
                      title="Clear"
                      onClick={() => setQuery('')}
                    >
                      <X />
                    </InputGroupButton>
                  </InputGroupAddon>
                )}
              </InputGroup>

              <div
                ref={attachScrollRef}
                className="border-border bg-background-deeper h-20 shrink-0 overflow-y-auto rounded-lg border p-1 [@media(min-height:40rem)]:h-40"
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
                <div ref={attachSentinelRef} style={{ height: 1 }} />
              </div>

              <div className="flex flex-col gap-1">
                {/* A native file input lays its internal button and
                filename out in the browser's shadow DOM, which outside
                CSS can't center - so the visible row is our own flex
                label wrapping a visually hidden input. Clicking the
                label (or pressing Enter on the focused input) opens the
                native dialog. */}
                <label className="bg-background-deeper focus-within:border-primary focus-within:ring-primary/50 flex h-7 w-full cursor-pointer items-center gap-2 rounded-md border border-border px-2.5 text-sm shadow-xs transition-[color,box-shadow] outline-none">
                  <input
                    type="file"
                    accept={IMAGE_ACCEPT}
                    aria-label="Custom image"
                    className="sr-only"
                    onChange={handleFileChange}
                    onClick={handleFileInputClick}
                  />
                  <Image
                    className="text-text-muted size-4 shrink-0"
                    aria-hidden
                  />
                  <span
                    className={`truncate ${
                      hasData && pickedName ? 'text-text' : 'text-text-muted'
                    }`}
                  >
                    {hasData && pickedName ? pickedName : 'Choose image...'}
                  </span>
                </label>
                {pickError && (
                  <p className="text-danger text-xs" role="alert">
                    {pickError}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <BackgroundSwatch
                  title="Background: theme primary (default)"
                  selected={!value.iconColor}
                  style={{ background: defaultIconBackground.background }}
                  onSelect={() => onChange({ ...value, iconColor: undefined })}
                />
                <BackgroundSwatch
                  title="Background: none"
                  selected={value.iconColor === ICON_BACKGROUND_NONE}
                  className="border-border border"
                  onSelect={() =>
                    onChange({ ...value, iconColor: ICON_BACKGROUND_NONE })
                  }
                >
                  <Slash className="text-text-muted size-3" />
                </BackgroundSwatch>
                {iconBackgroundPresets.map((preset) => (
                  <BackgroundSwatch
                    key={preset.id}
                    title={`Background: ${preset.label}`}
                    selected={value.iconColor === preset.id}
                    style={{ background: iconBackgroundGradient(preset) }}
                    onSelect={() =>
                      onChange({ ...value, iconColor: preset.id })
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="border-border/60 shrink-0 border-t pt-4 [@media(max-height:39.99rem)]:pt-3">
            <Button onClick={() => setOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Small rounded gradient swatch for choosing an icon's background square. */
function BackgroundSwatch({
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
      className={`flex size-5 items-center justify-center rounded-[22%] outline-none transition-[box-shadow,transform] duration-150 ease-out focus-visible:ring-[3px] focus-visible:ring-primary/50 active:scale-95 ${
        selected
          ? 'ring-primary-border ring-offset-surface ring-2 ring-offset-1'
          : 'hover:scale-105'
      } ${className}`}
    >
      {children}
    </button>
  );
}
