import {
  ICON_BACKGROUND_NONE,
  defaultIconBackground,
  iconBackgroundGradient,
  iconBackgroundPresets,
} from '@/utils/icon-backgrounds';
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
import { useState, type ChangeEvent, type MouseEvent } from 'react';
import { BackgroundSwatch } from './BackgroundSwatch';
import { CustomIconPreview } from './CustomIconPreview';
import { IconSquare } from './IconSquare';
import { LucideIconGrid } from './LucideIconGrid';
import { cn } from '@/utils/cn';
import { beginFileDialog, endFileDialog } from '@/utils/fileDialogGuard';
import {
  IMAGE_ACCEPT,
  MAX_ICON_BYTES,
  readFileAsDataUrl,
} from '@/utils/imageFile';

export interface IconPickerValue {
  icon?: string;
  iconPath?: string;
  iconData?: string;
  iconColor?: string;
}

interface IconPickerProps {
  value: IconPickerValue;
  onChange: (value: IconPickerValue) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pickError, setPickError] = useState<string | null>(null);
  const [pickedName, setPickedName] = useState<string | null>(null);

  const selectLucide = (name: string) =>
    onChange({
      ...value,
      icon: name,
      iconPath: undefined,
      iconData: undefined,
    });

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
        <DialogContent className="flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>Choose icon</DialogTitle>
            <DialogDescription>
              Pick a Lucide icon, or use a custom image.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 pb-1">
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

              <LucideIconGrid
                query={query}
                selectedName={selectedName}
                onSelect={selectLucide}
              />

              <div className="flex flex-col gap-1">
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
                    className={cn(
                      'truncate',
                      hasData && pickedName ? 'text-text' : 'text-text-muted'
                    )}
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

          <DialogFooter className="border-border/60 shrink-0 border-t pt-4">
            <Button onClick={() => setOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
