import * as RadixSlider from '@radix-ui/react-slider';

export default function Slider({
  value,
  setValue,
}: {
  value: number;
  setValue: (value: number) => void;
}) {
  return (
    <div className="flex w-[8rem] h-full touch-none select-none items-center justify-center rounded-xl overflow-visible">
      <RadixSlider.Root
        value={[value]}
        onValueChange={([v]) => v !== undefined && setValue(Math.floor(v))}
        onClick={(e) => e.stopPropagation()}
        step={0.01}
        className="relative flex w-full cursor-grab touch-none select-none rounded-full items-center active:cursor-grabbing"
      >
        <RadixSlider.Track className="relative isolate h-2 w-full rounded-full bg-background border border-border">
          <RadixSlider.Range
            className="absolute h-full bg-primary rounded-full"
            style={{
              width: `${value}%`,
            }}
          />
        </RadixSlider.Track>
      </RadixSlider.Root>
    </div>
  );
}
