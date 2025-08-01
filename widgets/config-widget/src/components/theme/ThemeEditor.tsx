import { useState, useEffect } from 'react';
import { Input, PanelLayout } from '@overline-zebar/ui';
import {
  defaultConfig,
  defaultTheme,
  useTheme,
  useThemeActions,
  useDebouncedThemeProperties,
  useThemeProperties,
  useThemes,
  Theme,
} from '@overline-zebar/config';
import {
  Button,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@overline-zebar/ui';

function SaveAsNewInput({
  onSaveAsNew,
  customTheme,
}: {
  onSaveAsNew: (newThemeName: string) => void;
  customTheme: Theme | null;
}) {
  const [newThemeName, setNewThemeName] = useState('');

  const handleSaveAsNew = () => {
    if (!customTheme || !newThemeName) return;
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
      <input
        type="color"
        value={value}
        onChange={(e) => onColorChange(e.target.value)}
        className="w-16 h-8"
      />
    </div>
  );
}

interface ThemeSelectorProps {
  isModified: boolean;
  onThemeChange: (themeName: string) => void;
  currentThemeName: string;
}

function ThemeSelector({
  isModified,
  onThemeChange,
  currentThemeName,
}: ThemeSelectorProps) {
  const [themes] = useThemes();
  const defaultThemeNames = defaultConfig.app.themes.map((t) => t.name);
  const savedThemes = themes.filter((t) => !defaultThemeNames.includes(t.name));
  const defaultThemes = themes.filter((t) =>
    defaultThemeNames.includes(t.name)
  );

  return (
    <Select onValueChange={onThemeChange} value={currentThemeName}>
      <SelectTrigger>
        <SelectValue placeholder="Select a value">
          {isModified ? 'Custom' : currentThemeName}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {savedThemes.length > 0 && (
          <SelectGroup>
            <SelectLabel>Saved Themes</SelectLabel>
            {savedThemes.map((theme) => (
              <SelectItem key={theme.name} value={theme.name}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        <SelectGroup>
          <SelectLabel>Default Themes</SelectLabel>
          {defaultThemes.map((theme) => (
            <SelectItem key={theme.name} value={theme.name}>
              {theme.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function ThemeEditor() {
  const [theme, setTheme] = useTheme();
  const { saveThemeAsNew, removeTheme } = useThemeActions();
  const debouncedSetThemeProperties = useDebouncedThemeProperties();
  const [originalTheme, setOriginalTheme] = useState<Theme | null>(null);
  const [customTheme, setCustomTheme] = useState<Theme | null>(null);

  const isDefaultTheme = (themeName: string) =>
    defaultConfig.app.themes.some((t) => t.name === themeName);

  useEffect(() => {
    if (theme) {
      document.documentElement.style.cssText = '';
      for (const [key, value] of Object.entries(theme.colors)) {
        document.documentElement.style.setProperty(key, value);
      }
    }
  }, [theme]);

  const handleColorChange = (colorName: string, newColor: string) => {
    if (!theme) return;

    if (isDefaultTheme(theme.name) && !originalTheme) {
      setOriginalTheme(JSON.parse(JSON.stringify(theme)));
    }

    const newTheme = customTheme || JSON.parse(JSON.stringify(theme));
    newTheme.name = 'Custom';
    newTheme.colors[colorName] = newColor;
    setCustomTheme(newTheme);
    debouncedSetThemeProperties(newTheme);
  };

  const handleThemeChange = (themeName: string) => {
    setCustomTheme(null);
    setOriginalTheme(null);
    setTheme(themeName);
  };

  const handleReset = () => {
    if (originalTheme) {
      setCustomTheme(null);
      setTheme(originalTheme.name);
      setOriginalTheme(null);
    }
  };

  const handleSaveAsNew = (newThemeName: string) => {
    if (customTheme) {
      saveThemeAsNew(customTheme, newThemeName);
      setCustomTheme(null);
      setOriginalTheme(null);
      setTheme(newThemeName);
    }
  };

  const handleRemoveTheme = () => {
    if (theme && !isDefaultTheme(theme.name)) {
      removeTheme(theme.name);
      setTheme(defaultTheme.name);
    }
  };

  const displayedTheme = customTheme || theme;
  const isModified = !!customTheme;

  return (
    <PanelLayout title="Appearance">
      <div className="px-3 py-1 space-y-6">
        <div>
          <h1 className="text-lg">Themes</h1>
          <p className="text-text-muted">
            Colour your overline widgets to match your style.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSelector
            isModified={isModified}
            onThemeChange={handleThemeChange}
            currentThemeName={theme?.name || defaultTheme.name}
          />
          {isModified && (
            <Button onClick={handleReset} className="h-full py-1 px-3">
              Reset
            </Button>
          )}
        </div>

        {displayedTheme && (
          <div className="space-y-4">
            {isModified && (
              <SaveAsNewInput
                onSaveAsNew={handleSaveAsNew}
                customTheme={customTheme}
              />
            )}
            {theme && !isDefaultTheme(theme.name) && !isModified && (
              <Button onClick={handleRemoveTheme} className="w-full bg-danger">
                Remove Theme
              </Button>
            )}

            {Object.entries(displayedTheme.colors).map(([name, value]) => (
              <ThemeColorPicker
                key={name}
                name={name}
                value={value}
                onColorChange={(newColor) => handleColorChange(name, newColor)}
              />
            ))}
          </div>
        )}
      </div>
    </PanelLayout>
  );
}

