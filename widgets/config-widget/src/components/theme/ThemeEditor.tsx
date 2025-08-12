import { useThemePreview, useThemes } from '@overline-zebar/config';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  ColorPicker,
} from '@overline-zebar/ui';
import { useState } from 'react';

function SaveAsNewInput({
  onSaveAsNew,
}: {
  onSaveAsNew: (newThemeName: string) => void;
}) {
  const [newThemeName, setNewThemeName] = useState('');

  const handleSaveAsNew = () => {
    if (!newThemeName) return;
    onSaveAsNew(newThemeName);
    setNewThemeName('');
  };

  return (
    <div className="flex items-center gap-2 h-10">
      <Input
        type="text"
        placeholder="New theme name"
        value={newThemeName}
        onChange={(e) => setNewThemeName(e.target.value)}
        inputContainerClassName="h-full"
        className="h-full"
      />
      <Button
        className="h-full"
        onClick={handleSaveAsNew}
        disabled={!newThemeName}
      >
        Save As New
      </Button>
    </div>
  );
}

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
        <SelectValue>{(value) => (isModified ? 'Custom' : value)}</SelectValue>
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
  const { activeTheme, isDefault, setActiveTheme, deleteTheme } = useThemes();
  const {
    previewTheme,
    isPreviewing,
    startPreview,
    updatePreview,
    cancelPreview,
    savePreview,
  } = useThemePreview();

  const handleColorChange = (colorName: string, newColor: string) => {
    if (!isPreviewing) {
      startPreview(activeTheme!);
    }
    updatePreview({ [colorName]: newColor });
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

  const handleRemoveTheme = () => {
    if (activeTheme && !isDefault(activeTheme.id)) {
      deleteTheme(activeTheme.id);
    }
  };

  const displayedTheme = previewTheme || activeTheme;
  const themeSelectorValue = isPreviewing ? 'custom' : activeTheme?.id || '';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ThemeSelector
          isModified={isPreviewing}
          onThemeChange={handleThemeChange}
          currentThemeId={themeSelectorValue}
        />
        {isPreviewing && (
          <Button onClick={handleReset} className="h-full py-1 px-3">
            Reset
          </Button>
        )}
      </div>

      {displayedTheme && (
        <div className="space-y-4">
          {isPreviewing && <SaveAsNewInput onSaveAsNew={handleSaveAsNew} />}
          {activeTheme && !isDefault(activeTheme.id) && !isPreviewing && (
            <Button onClick={handleRemoveTheme} className="w-full bg-danger">
              Remove Theme
            </Button>
          )}

          <div className="grid grid-cols-2 w-full gap-y-3 gap-x-6">
            {Object.entries(displayedTheme.colors).map(([name, value]) => (
              <ThemeColorPicker
                key={name}
                name={name}
                value={value}
                onColorChange={(newColor) => handleColorChange(name, newColor)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
