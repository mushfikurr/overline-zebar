import {
  LabelColor,
  useWidgetSetting,
  WeatherThreshold,
} from '@overline-zebar/config';
import {
  FieldTitle,
  FormField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@overline-zebar/ui';
import { NumberInput } from '../../../../NumberInput';

export function WeatherThresholds() {
  const [thresholds] = useWidgetSetting('main', 'weatherThresholds');

  return (
    <div className="w-full space-y-4">
      {(thresholds ?? []).map((t) => (
        <div className="flex items-center gap-4 w-full" key={t.id}>
          <ThresholdInput threshold={t} minOrMax="min" />
          <ThresholdInput threshold={t} minOrMax="max" />
          <ThresholdColorSelect threshold={t} />
        </div>
      ))}
    </div>
  );
}

type ThresholdInputProps = {
  threshold: WeatherThreshold;
  minOrMax: 'min' | 'max';
};

function ThresholdInput({ threshold, minOrMax }: ThresholdInputProps) {
  const [thresholds, setThresholds] = useWidgetSetting(
    'main',
    'weatherThresholds'
  );

  const handleChange = (newValue: number) => {
    const newThresholds = thresholds.map((t) =>
      t.id === threshold.id ? { ...t, [minOrMax]: newValue } : t
    );
    setThresholds(newThresholds);
  };

  const title = minOrMax.charAt(0).toUpperCase() + minOrMax.slice(1);

  return (
    <FormField className="w-full">
      <FieldTitle>{title}</FieldTitle>
      <NumberInput value={threshold[minOrMax]} onChange={handleChange} />
    </FormField>
  );
}

type ThresholdColorSelectProps = {
  threshold: WeatherThreshold;
};

function ThresholdColorSelect({ threshold }: ThresholdColorSelectProps) {
  const [thresholds, setThresholds] = useWidgetSetting(
    'main',
    'weatherThresholds'
  );

  const handleColorChange = (newValue: unknown) => {
    const newThresholds = thresholds.map((t) =>
      t.id === threshold.id ? { ...t, labelColor: newValue as LabelColor } : t
    );
    setThresholds(newThresholds);
  };

  return (
    <FormField className="w-full">
      <FieldTitle>Color</FieldTitle>
      <Select onValueChange={handleColorChange} value={threshold.labelColor}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="--danger">Danger</SelectItem>
          <SelectItem value="--warning">Warning</SelectItem>
          <SelectItem value="--text">Text</SelectItem>
        </SelectContent>
      </Select>
    </FormField>
  );
}

export default WeatherThresholds;
