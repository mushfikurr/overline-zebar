import {
  defaultConfig,
  useAppSetting,
  useThemes,
} from '@overline-zebar/config';
import {
  Button,
  FieldDescription,
  FieldInput,
  FieldTitle,
  FormField,
  Switch,
} from '@overline-zebar/ui';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { ThemeCard } from './ThemeCard';
import { ThemeEditorDialog } from './ThemeEditorDialog';

const darkSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

/** True if the slot still holds its factory default (or is unset), i.e. the
 * user has never picked a theme for it. */
function isUntouched(themeId: string | null, fallback: string | null) {
  return !themeId || themeId === fallback;
}

export function ThemePicker() {
  const { themes, activeTheme, isDefault, setActiveTheme, deleteTheme } =
    useThemes();
  const [systemThemeSync, setSystemThemeSync] =
    useAppSetting('systemThemeSync');
  const [lightThemeId, setLightThemeId] = useAppSetting('lightThemeId');
  const [darkThemeId, setDarkThemeId] = useAppSetting('darkThemeId');

  const [editorTarget, setEditorTarget] = useState<{
    themeId: string | null;
  } | null>(null);

  const systemMode = systemThemeSync;
  const savedThemes = themes.filter((theme) => !isDefault(theme.id));
  const defaultThemes = themes.filter((theme) => isDefault(theme.id));

  const handleSyncToggle = (enabled: boolean) => {
    if (enabled === systemThemeSync) return;

    if (enabled) {
      // Write the slots before enabling sync: each dispatch saves and
      // broadcasts immediately, so flipping the flag first would let the
      // sync hook snap to the factory themes in between.
      if (activeTheme) {
        if (isUntouched(lightThemeId, defaultConfig.app.lightThemeId)) {
          setLightThemeId(activeTheme.id);
        }
        if (isUntouched(darkThemeId, defaultConfig.app.darkThemeId)) {
          setDarkThemeId(activeTheme.id);
        }
      }
    }
    setSystemThemeSync(enabled);
  };

  const handleCardUse = (themeId: string) => {
    if (!systemMode) {
      setActiveTheme(themeId);
      return;
    }
    // Assign to the half matching the current Windows appearance.
    if (darkSchemeQuery.matches) {
      setDarkThemeId(themeId);
    } else {
      setLightThemeId(themeId);
    }
  };

  const editorTheme =
    editorTarget?.themeId != null
      ? (themes.find((theme) => theme.id === editorTarget.themeId) ?? null)
      : null;

  return (
    <div className="space-y-4">
      <FormField switch>
        <FieldTitle>Adapt to Windows theme</FieldTitle>
        <FieldInput>
          <Switch
            checked={systemThemeSync}
            onCheckedChange={handleSyncToggle}
          />
        </FieldInput>
        <FieldDescription>
          Switch themes automatically when Windows changes between light and
          dark mode. When off, the selected theme is always used.
        </FieldDescription>
      </FormField>

      <div className="flex items-center justify-between">
        <h3 className="text-text-muted text-sm">Themes</h3>
        <Button size="sm" onClick={() => setEditorTarget({ themeId: null })}>
          <PlusIcon />
          New Theme
        </Button>
      </div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))' }}
      >
        {[...defaultThemes, ...savedThemes].map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isActive={activeTheme?.id === theme.id}
            systemMode={systemMode}
            ownsLight={lightThemeId === theme.id}
            ownsDark={darkThemeId === theme.id}
            onUse={() => handleCardUse(theme.id)}
            onAssignLight={() => setLightThemeId(theme.id)}
            onAssignDark={() => setDarkThemeId(theme.id)}
            onEdit={
              isDefault(theme.id)
                ? undefined
                : () => setEditorTarget({ themeId: theme.id })
            }
            onRemove={
              isDefault(theme.id) ? undefined : () => deleteTheme(theme.id)
            }
          />
        ))}
      </div>

      <ThemeEditorDialog
        open={editorTarget !== null}
        theme={editorTheme}
        onOpenChange={(open) => {
          if (!open) setEditorTarget(null);
        }}
      />
    </div>
  );
}
