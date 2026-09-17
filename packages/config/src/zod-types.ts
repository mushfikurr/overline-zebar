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
  systemThemeSync: z.boolean().default(false),
  lightThemeId: z.string().nullable().default('latte'),
  darkThemeId: z.string().nullable().default('default'),
});

export const ProviderSettingsSchema = z.object({
  cpu: z.boolean().default(true),
  memory: z.boolean().default(true),
  weather: z.boolean().default(true),
  battery: z.boolean().default(true),
});

export const MainWidgetSettingsSchema = BaseWidgetSettingsSchema.extend({
  mediaMaxWidth: z.string().default('400'),
  weatherThresholds: z.array(ThresholdSchema).default([]),
  weatherUnit: z
    .union([z.literal('celsius'), z.literal('fahrenheit')])
    .default('celsius'),
  pinnedSystrayIcons: z.array(SystrayIconSchema).default([]),
  showSystray: z.boolean().default(true),
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
  /** Discriminator for the LauncherItem union. Absent on legacy data. */
  type: z.literal('command').optional(),
  /** Id of the folder this script lives in. Undefined means top level. */
  parentId: z.string().optional(),
  icon: z.string().optional(),
  iconPath: z.string().optional(),
  /** Inline data URL of a picked icon image. */
  iconData: z.string().optional(),
  /**
   * Background square behind the icon: undefined shows the theme primary,
   * 'none' disables it, otherwise an id from iconBackgrounds presets.
   */
  iconColor: z.string().optional(),
});

export const LauncherFolderSchema = z.object({
  id: z.string(),
  type: z.literal('folder'),
  title: z.string(),
  /**
   * Id of a parent folder. Folders currently only live at the top level,
   * but the field keeps the flat-array helpers uniform.
   */
  parentId: z.string().optional(),
});

export const LauncherItemSchema = z.union([
  LauncherFolderSchema,
  LauncherCommandSchema,
]);

export const ScriptLauncherWidgetSettingsSchema =
  BaseWidgetSettingsSchema.extend({
    applications: z.array(LauncherItemSchema),
    view: z.enum(['grid', 'list']).default('grid'),
    showCommands: z.boolean().default(true),
    collapsePaths: z.boolean().default(false),
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
