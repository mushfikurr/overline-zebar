import {
  useTheme,
  useThemes,
  useThemeProperties,
  defaultTheme,
  useDebouncedThemeProperties,
} from '@overline-zebar/config';
import {
  Button,
  Card,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@overline-zebar/ui';
import PanelLayout from '../common/PanelLayout';

export function ThemeEditor() {
  const [themes] = useThemes();
  const [theme, setTheme] = useTheme();
  const setThemeProperties = useThemeProperties();
  const debouncedSetThemeProperties = useDebouncedThemeProperties();

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

    // We use the debounced function here
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

  return (
    <PanelLayout title="Theme">
      <p>theme editorrrrrrrr asidamsda</p>
      <div className="p-4 space-y-4">
        <div className="flex justify-between">
          <Select onValueChange={handleThemeChange} value={theme?.name}>
            <SelectTrigger>
              <SelectValue placeholder="Select a theme" />
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
                  defaultValue={value}
                  onChange={(e) => handleColorChange(name, e.target.value)}
                  className="w-16 h-8"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </PanelLayout>
  );
}

