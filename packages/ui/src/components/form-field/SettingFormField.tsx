import type { ComponentProps } from 'react';
import {
  useAppSettingDefaults,
  useWidgetSettingDefaults,
  RootConfig,
  WidgetSettingsMap,
} from '@overline-zebar/config';
import { FormField } from './FormField';

type SettingFieldProps = Omit<
  ComponentProps<typeof FormField>,
  'isDefault' | 'onReset'
>;

interface AppFormFieldProps extends SettingFieldProps {
  setting: keyof RootConfig['app'] | readonly (keyof RootConfig['app'])[];
}

export function AppFormField({ setting, ...props }: AppFormFieldProps) {
  const keys = Array.isArray(setting) ? setting : [setting];
  const [isDefault, reset] = useAppSettingDefaults(keys);

  return <FormField isDefault={isDefault} onReset={reset} {...props} />;
}

interface WidgetFormFieldProps<W extends keyof WidgetSettingsMap>
  extends SettingFieldProps {
  widget: W;
  setting: keyof WidgetSettingsMap[W] | readonly (keyof WidgetSettingsMap[W])[];
}

export function WidgetFormField<W extends keyof WidgetSettingsMap>({
  widget,
  setting,
  ...props
}: WidgetFormFieldProps<W>) {
  const keys = Array.isArray(setting) ? setting : [setting];
  const [isDefault, reset] = useWidgetSettingDefaults(widget, keys);

  return <FormField isDefault={isDefault} onReset={reset} {...props} />;
}
