import {
  LabelColor,
  useWidgetSetting,
  Threshold,
} from '@overline-zebar/config';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
} from '@overline-zebar/ui';
import { Plus, Trash2 } from 'lucide-react';
import { NumberInput } from '../../../../NumberInput';

interface ThresholdsInputProps {
  thresholds?: Threshold[];
  onChange?: (thresholds: Threshold[]) => void;
  settingKey?:
    | 'weatherThresholds'
    | 'systemStatThresholds'
    | 'batteryThresholds';
}

type ThresholdBounds = { min: number; max: number };
type RangeEntry = { id: string; labelColor: LabelColor };

const labelColorOptions: { value: LabelColor; label: string }[] = [
  { value: '--text', label: 'Text' },
  { value: '--warning', label: 'Warning' },
  { value: '--danger', label: 'Danger' },
];

const segmentColorClasses: Record<LabelColor, string> = {
  '--text': 'bg-text',
  '--warning': 'bg-warning',
  '--danger': 'bg-danger',
};

function createRangeId() {
  return `range-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ThresholdsInput({
  thresholds: thresholdsProp,
  onChange: onChangeProp,
  settingKey = 'weatherThresholds',
}: ThresholdsInputProps = {}) {
  const [thresholdsInternal, setThresholdsInternal] = useWidgetSetting(
    'main',
    settingKey
  );
  const [weatherUnit] = useWidgetSetting('main', 'weatherUnit');

  const thresholds = thresholdsProp ?? thresholdsInternal;
  const setThresholds = onChangeProp ?? setThresholdsInternal;

  const bounds: ThresholdBounds =
    settingKey === 'weatherThresholds'
      ? weatherUnit === 'fahrenheit'
        ? { min: -30, max: 130 }
        : { min: -40, max: 60 }
      : { min: 0, max: 100 };

  // Thresholds are represented as contiguous ranges tiling the bounds:
  // `stops` holds the shared boundaries, `ranges` the color of each band.
  const sorted = [...(thresholds ?? [])].sort((a, b) => a.min - b.min);
  const ranges: RangeEntry[] = sorted.map((t) => ({
    id: t.id,
    labelColor: t.labelColor,
  }));
  const stops = [bounds.min];
  let previousStop = bounds.min;
  for (const [i, threshold] of sorted.slice(0, -1).entries()) {
    const remaining = sorted.length - 1 - i;
    previousStop = Math.min(
      Math.max(threshold.max, previousStop + 1),
      bounds.max - remaining
    );
    stops.push(previousStop);
  }
  stops.push(bounds.max);

  const interiorStops = stops.slice(1, -1);

  const commit = (nextRanges: RangeEntry[], nextStops: number[]) => {
    setThresholds(
      nextRanges.map((range, index) => ({
        id: range.id,
        min: nextStops[index] ?? bounds.min,
        max: nextStops[index + 1] ?? bounds.max,
        labelColor: range.labelColor,
      }))
    );
  };

  const handleStopsChange = (value: number | readonly number[]) => {
    if (typeof value === 'number' || value.length !== interiorStops.length) {
      return;
    }
    commit(ranges, [bounds.min, ...value, bounds.max]);
  };

  const widestRangeIndex = () => {
    let index = 0;
    let width = -1;
    for (let i = 0; i < ranges.length; i++) {
      const rangeWidth =
        (stops[i + 1] ?? bounds.max) - (stops[i] ?? bounds.min);
      if (rangeWidth > width) {
        width = rangeWidth;
        index = i;
      }
    }
    return { index, width };
  };

  const canAddRange =
    ranges.length === 0 ||
    (ranges.length < 20 && widestRangeIndex().width >= 2);

  const handleAddRange = () => {
    if (ranges.length === 0) {
      commit(
        [{ id: createRangeId(), labelColor: '--text' }],
        [bounds.min, bounds.max]
      );
      return;
    }
    const { index } = widestRangeIndex();
    const from = stops[index] ?? bounds.min;
    const to = stops[index + 1] ?? bounds.max;
    const midpoint = Math.floor((from + to) / 2);
    const neighborColors = [
      ranges[index]?.labelColor,
      ranges[index + 1]?.labelColor,
    ];
    const labelColor =
      labelColorOptions
        .map((option) => option.value)
        .find((color) => !neighborColors.includes(color)) ?? '--text';
    const nextStops = [
      ...stops.slice(0, index + 1),
      midpoint,
      ...stops.slice(index + 1),
    ];
    const nextRanges = [
      ...ranges.slice(0, index + 1),
      { id: createRangeId(), labelColor },
      ...ranges.slice(index + 1),
    ];
    commit(nextRanges, nextStops);
  };

  const handleDeleteRange = (index: number) => {
    if (ranges.length <= 1) {
      return;
    }
    // Merging into the previous range removes the boundary before it;
    // the first range merges into the one after it.
    const stopToRemove = index > 0 ? index : 1;
    commit(
      ranges.filter((_, i) => i !== index),
      stops.filter((_, i) => i !== stopToRemove)
    );
  };

  const handleStopChange = (stopIndex: number, newValue: number) => {
    const nextStops = [...stops];
    const lowerBound = (nextStops[stopIndex - 1] ?? bounds.min) + 1;
    const upperBound = (nextStops[stopIndex + 1] ?? bounds.max) - 1;
    nextStops[stopIndex] = Math.min(Math.max(newValue, lowerBound), upperBound);
    commit(ranges, nextStops);
  };

  const handleColorChange = (index: number, newValue: LabelColor) => {
    commit(
      ranges.map((range, i) =>
        i === index ? { ...range, labelColor: newValue } : range
      ),
      stops
    );
  };

  return (
    <div className="w-full space-y-3">
      <Slider
        value={interiorStops}
        min={bounds.min}
        max={bounds.max}
        step={1}
        minStepsBetweenValues={1}
        onValueChange={handleStopsChange}
        segments={ranges.map((range, index) => ({
          from: stops[index] ?? bounds.min,
          to: stops[index + 1] ?? bounds.max,
          className: segmentColorClasses[range.labelColor],
        }))}
        thumbAriaLabel={(index) =>
          `Boundary between range ${index + 1} and range ${index + 2}`
        }
        thumbClassName="border-background"
        thumbStyle={(index) => ({
          background: `var(${ranges[index]?.labelColor ?? '--text'})`,
        })}
      />
      <div className="space-y-2">
        {ranges.map((range, index) => (
          <div key={range.id} className="flex items-center gap-2">
            <div className="w-28 shrink-0">
              <ThresholdColorSelect
                value={range.labelColor}
                onChange={(newValue) => handleColorChange(index, newValue)}
              />
            </div>
            <div className="w-16 shrink-0">
              <NumberInput
                aria-label={`Start of range ${index + 1}`}
                value={stops[index] ?? bounds.min}
                min={bounds.min}
                max={bounds.max}
                disabled={index === 0}
                onChange={(newValue) => handleStopChange(index, newValue)}
              />
            </div>
            <span aria-hidden="true" className="text-text-muted text-xs">
              –
            </span>
            <div className="w-16 shrink-0">
              <NumberInput
                aria-label={`End of range ${index + 1}`}
                value={stops[index + 1] ?? bounds.max}
                min={bounds.min}
                max={bounds.max}
                disabled={index === ranges.length - 1}
                onChange={(newValue) => handleStopChange(index + 1, newValue)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Delete range ${stops[index] ?? bounds.min} to ${
                stops[index + 1] ?? bounds.max
              }`}
              title="Remove range"
              disabled={ranges.length <= 1}
              onClick={() => handleDeleteRange(index)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" onClick={handleAddRange} disabled={!canAddRange}>
        <Plus />
        Add
      </Button>
    </div>
  );
}

function ThresholdColorSelect({
  value,
  onChange,
}: {
  value: LabelColor;
  onChange: (newValue: LabelColor) => void;
}) {
  return (
    <Select
      items={labelColorOptions}
      value={value}
      onValueChange={(newValue) => onChange(newValue as LabelColor)}
    >
      <SelectTrigger className="w-full" aria-label="Range color">
        <span
          className="size-2.5 shrink-0 rounded-full border border-border"
          style={{ backgroundColor: `var(${value})` }}
        />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {labelColorOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: `var(${option.value})` }}
              />
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default ThresholdsInput;
