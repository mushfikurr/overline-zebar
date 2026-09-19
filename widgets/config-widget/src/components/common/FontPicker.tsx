import { useAppSetting } from '@overline-zebar/config';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  Spinner,
} from '@overline-zebar/ui';
import {
  CheckIcon,
  FolderLock,
  SearchIcon,
  XIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useFontPermission } from '../../hooks/useFontPermission';
import { useLocalFontAccess } from '../../hooks/useLocalFontAccess';
import { useLocalFonts } from '../../hooks/useLocalFonts';
import { cn } from '../../utils/cn';

function familyCss(family: string): string {
  return `'${family.replace(/'/g, "\\'")}'`;
}

interface FontPickerFallbackProps {
  value: string;
  onChange: (value: string) => void;
}

function FontPickerFallback({ value, onChange }: FontPickerFallbackProps) {
  return (
    <Input
      value={value}
      placeholder="e.g., Cascadia Code"
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

interface FontTriggerProps {
  fontFamily: string;
  onClick: () => void;
}

function FontTrigger({ fontFamily, onClick }: FontTriggerProps) {
  return (
    <Button type="button" onClick={onClick}>
      <span
        className="truncate text-left"
        style={{ fontFamily: familyCss(fontFamily) }}
      >
        {fontFamily || 'Default'}
      </span>
    </Button>
  );
}

interface FontRowProps {
  family: string;
  active: boolean;
  onSelect: (family: string) => void;
}

function FontRow({ family, active, onSelect }: FontRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(family)}
      className={cn(
        'hover:bg-button/80 flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
        active && 'bg-primary text-text'
      )}
    >
      <span
        className="truncate text-left"
        style={{ fontFamily: familyCss(family) }}
      >
        {family}
      </span>
      {active && <CheckIcon className="size-3.5 shrink-0" />}
    </button>
  );
}

export default function FontPicker() {
  const [fontFamily, setFontFamily] = useAppSetting('fontFamily');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const supported = useLocalFontAccess();
  const { permission } = useFontPermission(open);
  const { fonts, loading, loadError, loadFonts, reset } = useLocalFonts({
    open,
    permission,
    supported,
  });

  const filtered = useMemo(() => {
    if (!fonts) return [];
    const q = query.trim().toLowerCase();
    if (!q) return fonts;
    return fonts.filter((f) => f.toLowerCase().includes(q));
  }, [fonts, query]);

  if (!supported) {
    return <FontPickerFallback value={fontFamily} onChange={setFontFamily} />;
  }

  return (
    <>
      <FontTrigger fontFamily={fontFamily} onClick={() => setOpen(true)} />
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setQuery('');
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Choose Font</DialogTitle>
            <DialogDescription>
              Font used across all widgets. Defaults to Geist Mono.
            </DialogDescription>
          </DialogHeader>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText>
                <SearchIcon className="size-3.5" />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              className="px-2"
              placeholder="Search fonts..."
              value={query}
              autoFocus
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label="Clear search"
                  title="Clear"
                  onClick={() => setQuery('')}
                >
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
          <div className="border-border bg-background-deeper h-[60vh] overflow-y-auto rounded-md border p-1">
            {fonts === null &&
              !loading &&
              !loadError &&
              (permission === 'prompt' || permission === 'denied') && (
                <div className="text-text-muted flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
                  <FolderLock className="size-7 opacity-60" />
                  <div className="space-y-1">
                    <p className="text-text text-sm font-medium">
                      Grant font access
                    </p>
                    <p className="text-xs max-w-[50ch] text-pretty">
                      A popup will appear requesting permission to read your
                      installed font families.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-1"
                    onClick={loadFonts}
                  >
                    Grant access
                  </Button>
                </div>
              )}
            {fonts === null &&
              !loading &&
              !loadError &&
              permission === null && (
                <div className="text-text-muted flex h-full items-center justify-center gap-2 text-xs">
                  <Spinner className="size-3.5" />
                  Checking permission...
                </div>
              )}
            {loading && (
              <div className="text-text-muted flex h-full items-center justify-center gap-2 text-xs">
                <Spinner className="size-3.5" />
                Loading installed fonts...
              </div>
            )}
            {!loading && loadError && (
              <div className="text-text-muted flex h-full flex-col items-center justify-center gap-2 text-xs">
                <span>Could not load fonts.</span>
                <Button type="button" size="sm" variant="ghost" onClick={reset}>
                  Try again
                </Button>
              </div>
            )}
            {!loading && !loadError && filtered.length === 0 && (
              <div className="text-text-muted px-2 py-3 text-xs">
                No fonts match &quot;{query}&quot;.
              </div>
            )}
            {!loading &&
              filtered.map((family) => (
                <FontRow
                  key={family}
                  family={family}
                  active={family === fontFamily}
                  onSelect={setFontFamily}
                />
              ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
