import {
  generateThemeFromColor,
  useThemes,
  useThemePreview,
  Theme,
} from '@overline-zebar/config';
import {
  Button,
  ColorPicker,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@overline-zebar/ui';
import { useEffect, useState } from 'react';

interface ThemeColorPickerProps {
  name: string;
  value: string;
  onColorChange: (newColor: string) => void;
}

function ThemeColorPicker({
  name,
  value,
  onColorChange,
}: ThemeColorPickerProps) {
  return (
    <div key={name} className="flex items-center justify-between">
      <label>{name}</label>
      <ColorPicker value={value} onChange={onColorChange} />
    </div>
  );
}

interface ThemeEditorDialogProps {
  open: boolean;
  /** Theme to edit, or null to create a new one seeded from the active theme. */
  theme: Theme | null;
  onOpenChange: (open: boolean) => void;
}

export function ThemeEditorDialog({
  open,
  theme,
  onOpenChange,
}: ThemeEditorDialogProps) {
  const { themes, activeTheme, isDefault, updateTheme } = useThemes();
  const {
    previewTheme,
    startPreview,
    updatePreview,
    cancelPreview,
    savePreview,
  } = useThemePreview();
  const [editorMode, setEditorMode] = useState('simple');
  const [nameInput, setNameInput] = useState('');
  const [seededId, setSeededId] = useState<string | null>(null);

  const seedTheme = theme ?? activeTheme;
  const seedId = theme?.id ?? activeTheme?.id ?? null;

  // Seed the live preview once per dialog session.
  useEffect(() => {
    if (!open) {
      setSeededId(null);
      return;
    }
    if (seedTheme && seedId !== null && seededId !== seedId) {
      startPreview(seedTheme);
      setSeededId(seedId);
      setNameInput(theme?.name ?? '');
      setEditorMode('simple');
    }
  }, [open, seededId, seedId, seedTheme, theme, startPreview]);

  if (!open || !seedTheme) return null;

  const isSavedTheme = !!theme && !isDefault(theme.id);
  const displayedTheme = previewTheme ?? seedTheme;

  const handleClose = () => {
    if (previewTheme) cancelPreview();
    setNameInput('');
    onOpenChange(false);
  };

  const handleColorChange = (colorName: string, newColor: string) => {
    updatePreview({ [colorName]: newColor });
  };

  const handleGenerateTheme = (baseColor: string) => {
    updatePreview(generateThemeFromColor(baseColor).colors);
  };

  const handleReset = () => {
    startPreview(seedTheme);
  };

  const handleSaveChanges = () => {
    if (!previewTheme || !theme) return;
    updateTheme({
      ...theme,
      name: nameInput.trim() || theme.name,
      colors: previewTheme.colors,
    });
    cancelPreview();
    onOpenChange(false);
  };

  /** "MyTheme" -> "MyTheme copy", deduped against existing theme names. */
  const uniqueCopyName = () => {
    const base = nameInput.trim() || theme?.name || seedTheme.name;
    const names = new Set(themes.map((t) => t.name));
    let candidate = `${base} copy`;
    let count = 2;
    while (names.has(candidate)) candidate = `${base} copy ${count++}`;
    return candidate;
  };

  const handleSaveAsNew = () => {
    if (!previewTheme) return;
    savePreview(uniqueCopyName());
    onOpenChange(false);
  };

  const handleCreate = () => {
    const name = nameInput.trim();
    if (!name || !previewTheme) return;
    savePreview(name);
    onOpenChange(false);
  };

  const primaryAction = isSavedTheme ? handleSaveChanges : handleCreate;
  const primaryLabel = isSavedTheme ? 'Save Changes' : 'Create Theme';
  const primaryDisabled = isSavedTheme
    ? !previewTheme
    : !nameInput.trim() || !previewTheme;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isSavedTheme ? 'Edit Theme' : 'New Theme'}</DialogTitle>
          <DialogDescription>
            Changes preview live on your widgets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <label htmlFor="theme-name" className="text-sm">
            Name
          </label>
          <Input
            id="theme-name"
            type="text"
            placeholder="Theme name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && primaryAction()}
          />
        </div>

        <Tabs value={editorMode} onValueChange={setEditorMode}>
          <TabsList>
            <TabsTrigger value="simple">Simple</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          <TabsContent value="simple">
            <div className="flex items-center justify-between pt-4">
              <label>Base Color</label>
              <ColorPicker
                value={displayedTheme.colors['--background'] || '#000000'}
                onChange={handleGenerateTheme}
              />
            </div>
          </TabsContent>
          <TabsContent value="advanced">
            <div className="grid w-full grid-cols-2 gap-x-6 gap-y-3 pt-4">
              {Object.entries(displayedTheme.colors).map(([name, value]) => (
                <ThemeColorPicker
                  key={name}
                  name={name}
                  value={value}
                  onColorChange={(newColor) =>
                    handleColorChange(name, newColor)
                  }
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <div className="flex-1" />
          {isSavedTheme && (
            <Button
              variant="outline"
              onClick={handleSaveAsNew}
              disabled={!previewTheme}
            >
              Save As New
            </Button>
          )}
          <Button onClick={primaryAction} disabled={primaryDisabled}>
            {primaryLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
