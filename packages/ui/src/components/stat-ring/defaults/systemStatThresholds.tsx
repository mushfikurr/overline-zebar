import { LabelType } from '../types/labelType';
import { Thresholds } from '../types/thresholds';

export const systemStatThresholds: Thresholds = [
  { min: 0, max: 70, label: LabelType.DEFAULT },
  { min: 70, max: 85, label: LabelType.WARNING },
  { min: 85, max: 100, label: LabelType.DANGER },
];
