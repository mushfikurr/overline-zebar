import { WeatherThreshold } from '@overline-zebar/config';
import { cn } from '../../../utils/cn';

interface StatProps {
  Icon: React.ReactNode;
  stat: string;
  threshold?: WeatherThreshold[];
}

export function StatInline({ Icon, stat, threshold }: StatProps) {
  function getNumbersFromString(str: string) {
    const numbers = str.match(/-?\d+/g)?.map(Number);
    return numbers && numbers.length > 0 ? numbers[0] : NaN;
  }

  function getThresholdLabel(value: number) {
    if (!threshold) return;
    const range = threshold.find((r) => value >= r.min && value <= r.max);
    return range ? range.labelColor : undefined;
  }

  const statAsInt = getNumbersFromString(stat);
  const thresholdLabel = getThresholdLabel(statAsInt ?? NaN);

  return (
    <div
      className={cn('flex items-center justify-center gap-1.5')}
      style={{ color: thresholdLabel ? `var(${thresholdLabel})` : undefined }}
    >
      {Icon}
      <p>{stat}</p>
    </div>
  );
}
