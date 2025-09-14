import {
  generateThemeFromColor,
  useThemePreview,
  useThemes,
} from '@overline-zebar/config';
import {
  Button,
  ColorPicker,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@overline-zebar/ui';
import { useState } from 'react';
import SaveAsNewDialog from './SaveAsNewDialog';

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

interface ThemeSelectorProps {
  isModified: boolean;
  onThemeChange: (themeId: unknown) => void;
  currentThemeId: string;
}

function ThemeSelector({
  isModified,
  onThemeChange,
  currentThemeId,
}: ThemeSelectorProps) {
  const { themes, isDefault } = useThemes();
  const savedThemes = themes.filter((t) => !isDefault(t.id));
  const defaultThemes = themes.filter((t) => isDefault(t.id));

  return (
    <Select onValueChange={onThemeChange} value={currentThemeId}>
      <SelectTrigger>
        <SelectValue>
          {(value) =>
            isModified ? 'Custom' : themes.find((f) => f.id == value)?.name
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {savedThemes.length > 0 && (
          <SelectGroup>
            <SelectLabel>Saved Themes</SelectLabel>
            {savedThemes.map((theme) => (
              <SelectItem key={theme.id} value={theme.id}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        <SelectGroup>
          <SelectLabel>Default Themes</SelectLabel>
          {defaultThemes.map((theme) => (
            <SelectItem key={theme.id} value={theme.id}>
              {theme.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function ThemeEditor() {
  const { activeTheme, isDefault, setActiveTheme, deleteTheme, updateTheme } =
    useThemes();
  const {
    previewTheme,
    isPreviewing,
    startPreview,
    updatePreview,
    cancelPreview,
    savePreview,
  } = useThemePreview();
  const [editorMode, setEditorMode] = useState('simple');

  const handleColorChange = (colorName: string, newColor: string) => {
    if (!isPreviewing) {
      startPreview(activeTheme!);
    }
    updatePreview({ [colorName]: newColor });
  };

  const handleGenerateTheme = (baseColor: string) => {
    const newTheme = generateThemeFromColor(baseColor);
    if (!isPreviewing) {
      startPreview(activeTheme!); // start preview with the original theme
    }
    updatePreview(newTheme.colors);
  };

  const handleThemeChange = (themeId: unknown) => {
    if (typeof themeId !== 'string') return;

    if (isPreviewing) {
      cancelPreview();
    }
    setActiveTheme(themeId);
  };

  const handleReset = () => {
    if (!activeTheme) return;
    cancelPreview();
    setActiveTheme(activeTheme.id);
  };

  const handleSaveAsNew = (newThemeName: string) => {
    savePreview(newThemeName);
  };

  const handleSaveEdit = () => {
    if (!previewTheme) return;
    updateTheme(previewTheme);
    setActiveTheme(previewTheme.id);
    cancelPreview();
  };

  const handleRemoveTheme = () => {
    if (activeTheme && !isDefault(activeTheme.id)) {
      deleteTheme(activeTheme.id);
    }
  };

  const displayedTheme = previewTheme || activeTheme;
  const themeSelectorValue = isPreviewing ? 'custom' : activeTheme?.id || '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <ThemeSelector
          isModified={isPreviewing}
          onThemeChange={handleThemeChange}
          currentThemeId={themeSelectorValue}
        />
        <div className="flex gap-3 items-center">
          {isPreviewing && (
            <Button onClick={handleReset} className="h-full py-1 px-3">
              Reset
            </Button>
          )}
          {isPreviewing && (
            <>
              <SaveAsNewDialog onSaveAsNew={handleSaveAsNew} />
              {activeTheme && !isDefault(activeTheme.id) && (
                <Button onClick={handleSaveEdit}>Save Edit</Button>
              )}
            </>
          )}
          {activeTheme && !isDefault(activeTheme.id) && !isPreviewing && (
            <Button onClick={handleRemoveTheme}>Remove Theme</Button>
          )}
        </div>
      </div>

      <Tabs value={editorMode} onValueChange={setEditorMode}>
        <TabsList>
          <TabsTrigger value="simple">Simple</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="advanced">
          {displayedTheme && (
            <div className="grid grid-cols-2 w-full gap-y-3 gap-x-6 pt-4">
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
          )}
        </TabsContent>
        <TabsContent value="simple">
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <label>Base Color</label>
              <ColorPicker
                value={displayedTheme?.colors['--background'] || '#000000'}
                onChange={handleGenerateTheme}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
