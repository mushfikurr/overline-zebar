import { AllWidgetSettings } from "./types";

const launchedWidgets = new Set<keyof AllWidgetSettings>();

export const widgetRegistry = {
  isLaunched: (widgetName: keyof AllWidgetSettings): boolean => {
    return launchedWidgets.has(widgetName);
  },
  setLaunched: (widgetName: keyof AllWidgetSettings): void => {
    launchedWidgets.add(widgetName);
  },
};
