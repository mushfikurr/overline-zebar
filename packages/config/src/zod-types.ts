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

export const ThresholdSchema = z.object({
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
  windowEffect: z.string().default('acrylic'),
  fontFamily: z.string().default('Geist Mono'),
});

export const ProviderSettingsSchema = z.object({
  cpu: z.boolean().default(true),
  memory: z.boolean().default(true),
  weather: z.boolean().default(true),
  battery: z.boolean().default(true),
});

export const MainWidgetSettingsSchema = BaseWidgetSettingsSchema.extend({
  flowLauncherPath: z.string().default(''),
  mediaMaxWidth: z.string().default('400'),
  weatherThresholds: z.array(ThresholdSchema).default([]),
  weatherUnit: z
    .union([z.literal('celsius'), z.literal('fahrenheit')])
    .default('celsius'),
  pinnedSystrayIcons: z.array(SystrayIconSchema).default([]),
  marginX: z.number().default(0),
  paddingLeft: z.number().default(4),
  paddingRight: z.number().default(4),
  dynamicWorkspaceIndicator: z.boolean().default(false),
  timeFormat: z.string().default('EEE d MMM t'),
  timeLocale: z.string().default('en-GB'),
  providers: ProviderSettingsSchema.default({}),
  systemStatThresholds: z.array(ThresholdSchema).default([]),
  batteryThresholds: z.array(ThresholdSchema).default([]),
  useInlineStats: z.boolean().default(false),
});

export const LauncherCommandSchema = z.object({
  id: z.string(),
  command: z.string(),
  args: z.array(z.string()),
  title: z.string(),
  icon: z.string().optional(),
});

export const ScriptLauncherWidgetSettingsSchema =
  BaseWidgetSettingsSchema.extend({
    applications: z.array(LauncherCommandSchema),
  });

export const AllWidgetSettingsSchema = z.object({
  main: MainWidgetSettingsSchema,
  'script-launcher': ScriptLauncherWidgetSettingsSchema,
  'config-widget': z.object({}),
});

export const RootConfigSchema = z.object({
  version: z.number(),
  app: AppSettingsSchema,
  widgets: AllWidgetSettingsSchema.partial(),
});
