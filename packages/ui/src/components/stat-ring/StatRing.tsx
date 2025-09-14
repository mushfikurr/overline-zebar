import { cn } from '../../utils/cn';
import Ring from './components/Ring';
import { systemStatThresholds } from './defaults/systemStatThresholds';
import { LabelType } from './types/labelType';
import { Thresholds } from './types/thresholds';

interface StatRingProps {
  Icon: React.ReactNode;
  stat: string;
  threshold?: Thresholds;
}

export function StatRing({
  Icon,
  stat,
  threshold = systemStatThresholds,
}: StatRingProps) {
  function getNumbersFromString(str: string): number {
    const match = str.match(/-?\d+/g);
    if (match && match.length > 0) {
      const num = Number(match[0]);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }

  function getThresholdLabel(value: number) {
    const range = threshold.find((r) => value >= r.min && value <= r.max);
    return range ? range.label : LabelType.DEFAULT;
  }

  const statAsInt = getNumbersFromString(stat);
  const thresholdLabel = getThresholdLabel(statAsInt);

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-1.5',
        thresholdLabel === LabelType.DEFAULT && 'text-text',
        thresholdLabel === LabelType.WARNING && 'text-warning',
        thresholdLabel === LabelType.DANGER && 'text-danger'
      )}
    >
      {Icon}
      <Ring
        percentage={statAsInt}
        className="h-3.5 w-3.5"
        strokeColor={cn(
          thresholdLabel === LabelType.DEFAULT && 'stroke-success',
          thresholdLabel === LabelType.WARNING && 'stroke-warning',
          thresholdLabel === LabelType.DANGER && 'stroke-danger'
        )}
      />
    </div>
  );
}
