import { LabelType } from "../types/labelType";
import { Thresholds } from "../types/thresholds";

export const systemStatThresholds: Thresholds = [
  { min: 0, max: 70, label: LabelType.DEFAULT },
  { min: 70, max: 85, label: LabelType.WARNING },
  { min: 85, max: 100, label: LabelType.DANGER },
];

export const weatherThresholds: Thresholds = [
  { min: -10, max: 0, label: LabelType.DANGER },
  { min: 1, max: 15, label: LabelType.DEFAULT },
  { min: 16, max: 25, label: LabelType.WARNING },
  { min: 26, max: 35, label: LabelType.DANGER },
];

export const batteryThresholds: Thresholds = [
  { min: 0, max: 10, label: LabelType.DANGER },
  { min: 11, max: 20, label: LabelType.WARNING },
  { min: 21, max: 100, label: LabelType.DEFAULT },
];