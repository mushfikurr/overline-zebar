import { z } from 'zod';

const SystrayIconSchema = z.string();

export const ThemeSchema = z.object({
  id: z.string(),
  name: z.string(),
  colors: z.record(z.string()),
});

export const LabelColorSchema = z.union([
  z.literal('--danger'),
  z.literal('--warning'),
  z.literal('--text'),
]);

export const BaseWidgetSettingsSchema = z.object({});

export const WeatherThresholdSchema = z.object({
  id: z.string(),
  min: z.number(),
  max: z.number(),
  labelColor: LabelColorSchema,
});

export const AppSettingsSchema = z.object({
  useAutoTiling: z.boolean(),
  zebarWebsocketUri: z.string(),
  themes: z.array(ThemeSchema),
  currentThemeId: z.string(),
  radius: z.string(),
});

export const ProviderSettingsSchema = z.object({
  cpu: z.boolean().default(true),
  memory: z.boolean().default(true),
  weather: z.boolean().default(true),
  battery: z.boolean().default(true),
});

export const MainWidgetSettingsSchema = BaseWidgetSettingsSchema.extend({
  flowLauncherPath: z.string(),
  mediaMaxWidth: z.string(),
  weatherThresholds: z.array(WeatherThresholdSchema),
  weatherUnit: z.union([z.literal('celsius'), z.literal('fahrenheit')]),
  pinnedSystrayIcons: z.array(SystrayIconSchema),
  marginX: z.number(),
  paddingLeft: z.number(),
  paddingRight: z.number(),
  dynamicWorkspaceIndicator: z.boolean(),
  providers: ProviderSettingsSchema.default({}),
});

export const LauncherCommandSchema = z.object({
  id: z.string(),
  command: z.string(),
  args: z.array(z.string()),
  title: z.string(),
  icon: z.string().optional(),
});

export const AppLauncherWidgetSettingsSchema = BaseWidgetSettingsSchema.extend({
  applications: z.array(LauncherCommandSchema),
});

export const AllWidgetSettingsSchema = z.object({
  main: MainWidgetSettingsSchema,
  'app-launcher': AppLauncherWidgetSettingsSchema,
  'config-widget': z.object({}),
});

export const RootConfigSchema = z.object({
  version: z.number(),
  app: AppSettingsSchema,
  widgets: AllWidgetSettingsSchema.partial(),
});
