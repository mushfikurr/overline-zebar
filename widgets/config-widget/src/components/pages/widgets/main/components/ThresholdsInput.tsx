import {
  LabelColor,
  Threshold,
  useWidgetSetting,
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
import {
  labelColorOptions,
  ThresholdBounds,
  useThresholdRanges,
} from '../../../../../hooks/useThresholdRanges';

interface ThresholdsInputProps {
  thresholds?: Threshold[];
  onChange?: (thresholds: Threshold[]) => void;
  settingKey?:
    | 'weatherThresholds'
    | 'systemStatThresholds'
    | 'batteryThresholds';
}

const segmentColorClasses: Record<LabelColor, string> = {
  '--text': 'bg-text',
  '--warning': 'bg-warning',
  '--danger': 'bg-danger',
};

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

  const {
    ranges,
    stops,
    interiorStops,
    canAddRange,
    addRange,
    deleteRange,
    setStop,
    setInteriorStops,
    setColor,
  } = useThresholdRanges(thresholds, setThresholds, bounds);

  return (
    <div className="w-full space-y-3">
      {ranges.length > 0 ? (
        <Slider
          aria-label="Threshold ranges"
          value={interiorStops}
          min={bounds.min}
          max={bounds.max}
          step={1}
          minStepsBetweenValues={1}
          onValueChange={(value) => {
            if (typeof value !== 'number') {
              setInteriorStops(value);
            }
          }}
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
      ) : (
        <p className="text-text-muted text-sm">No ranges configured.</p>
      )}
      <div className="space-y-2">
        {ranges.map((range, index) => (
          <div key={range.id} className="flex items-center gap-2">
            <div className="w-28 shrink-0">
              <ThresholdColorSelect
                value={range.labelColor}
                onChange={(newValue) => setColor(index, newValue)}
              />
            </div>
            <div className="w-16 shrink-0">
              <NumberInput
                aria-label={`Start of range ${index + 1}`}
                value={stops[index] ?? bounds.min}
                min={bounds.min}
                max={bounds.max}
                disabled={index === 0}
                onChange={(newValue) => setStop(index, newValue)}
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
                onChange={(newValue) => setStop(index + 1, newValue)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove range ${index + 1}`}
              title="Remove range"
              disabled={ranges.length <= 1}
              onClick={() => deleteRange(index)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" onClick={addRange} disabled={!canAddRange}>
        <Plus />
        Add range
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
