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
});

export const MainWidgetSettingsSchema = z.object({
  flowLauncherPath: z.string(),
  mediaMaxWidth: z.string(),
  weatherThresholds: z.array(WeatherThresholdSchema),
  weatherUnit: z.union([z.literal('celsius'), z.literal('fahrenheit')]),
  pinnedSystrayIcons: z.array(SystrayIconSchema),
  marginX: z.number(),
  paddingX: z.number(),
});

export const AllWidgetSettingsSchema = z.object({
  main: MainWidgetSettingsSchema,
});

export const RootConfigSchema = z.object({
  version: z.number(),
  app: AppSettingsSchema,
  widgets: AllWidgetSettingsSchema.partial(),
});
