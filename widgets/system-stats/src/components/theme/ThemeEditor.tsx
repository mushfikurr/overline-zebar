import {
  defaultTheme,
  useDebouncedThemeProperties,
  useTheme,
  useThemeActions,
  useThemeProperties,
  useThemes,
} from '@overline-zebar/config';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@overline-zebar/ui';
import { useState } from 'react';
import PanelLayout from '../common/PanelLayout';

export function ThemeEditor() {
  const [themes] = useThemes();
  const [theme, setTheme] = useTheme();
  const setThemeProperties = useThemeProperties();
  const debouncedSetThemeProperties = useDebouncedThemeProperties();
  const { removeTheme, saveThemeAsNew } = useThemeActions();

  const [newThemeName, setNewThemeName] = useState('');

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName);
  };

  const handleColorChange = (colorName: string, colorValue: string) => {
    if (!theme) return;

    const newTheme = {
      ...theme,
      colors: {
        ...theme.colors,
        [colorName]: colorValue,
      },
    };

    debouncedSetThemeProperties(newTheme);
  };

  const handleResetTheme = () => {
    if (!theme) return;

    const newTheme = {
      ...theme,
      colors: defaultTheme.colors,
    };

    setThemeProperties(newTheme);
  };

  const handleSaveAsNew = () => {
    if (!theme || !newThemeName) return;
    saveThemeAsNew(theme, newThemeName);
    setNewThemeName('');
  };

  const handleRemoveTheme = () => {
    if (!theme || theme.name === defaultTheme.name) return; // Prevent removing default theme
    removeTheme(theme.name);
    setTheme(defaultTheme.name); // Switch to default theme after removing
  };

  return (
    <PanelLayout title="Theme">
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <Select
            onValueChange={handleThemeChange}
            value={theme?.name || defaultTheme.name}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a value">
                {(value) => <span>{value}</span>}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {themes.map((theme) => (
                <SelectItem key={theme.name} value={theme.name}>
                  {theme.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleResetTheme}>Reset</Button>
        </div>

        {theme && (
          <div className="space-y-2">
            {Object.entries(theme.colors).map(([name, value]) => (
              <div key={name} className="flex items-center justify-between">
                <label>{name}</label>
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(name, e.target.value)}
                  className="w-16 h-8"
                />
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="New theme name"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                className="flex-grow p-2 border rounded bg-background-deeper border-button-border"
              />
              <Button onClick={handleSaveAsNew} disabled={!newThemeName}>
                Save As New
              </Button>
            </div>
            {theme.name !== defaultTheme.name && (
              <Button onClick={handleRemoveTheme} className="w-full bg-danger">
                Remove Theme
              </Button>
            )}
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
