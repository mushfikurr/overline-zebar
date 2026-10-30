'use client';

import * as React from 'react';
import { Slider as BaseSlider } from '@base-ui-components/react/slider';

import { cn } from '../utils/cn';

interface SliderSegment {
  from: number;
  to: number;
  className?: string;
}

interface SliderProps extends React.ComponentProps<typeof BaseSlider.Root> {
  indicatorClassName?: string;
  thumbClassName?: string;
  thumbAriaLabel?: (index: number) => string;
  thumbStyle?: (index: number) => React.CSSProperties | undefined;
  /**
   * When provided, renders colored segments between the given values
   * instead of the default single indicator fill.
   */
  segments?: readonly SliderSegment[];
}

function Slider({
  className,
  indicatorClassName,
  thumbClassName,
  thumbAriaLabel,
  thumbStyle,
  segments,
  thumbAlignment = segments ? 'edge' : 'center',
  defaultValue,
  value,
  min: minProp,
  max: maxProp,
  ...props
}: SliderProps) {
  const initialValues = defaultValue ?? value;
  const thumbCount =
    typeof initialValues === 'number' ? 1 : (initialValues?.length ?? 1);

  const min = minProp ?? 0;
  const max = maxProp ?? 100;
  const span = Math.max(max - min, 1);
  const toPercent = (sliderValue: number) => ((sliderValue - min) / span) * 100;

  return (
    <BaseSlider.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={minProp}
      max={maxProp}
      thumbAlignment={thumbAlignment}
      className={cn(
        'relative flex w-full touch-none select-none items-center data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <BaseSlider.Control
        data-slot="slider-control"
        className="relative inline-flex h-8 w-full items-center"
      >
        <BaseSlider.Track
          data-slot="slider-track"
          className="bg-background-deeper relative h-1.5 w-full grow overflow-hidden rounded-full"
        >
          {segments ? (
            // Inset by half the thumb (size-4 = 16px, half = 8px = left-2/right-2)
            // so segment boundaries land exactly on the thumb centers, matching
            // Base UI's inset thumb positioning (thumbAlignment="edge"). The
            // first and last segments bleed out to the track ends.
            <div
              data-slot="slider-segments"
              aria-hidden="true"
              className="absolute inset-y-0 right-2 left-2"
            >
              {segments.map((segment, index) => (
                <div
                  key={index}
                  data-slot="slider-segment"
                  className={cn('absolute inset-y-0', segment.className)}
                  style={{
                    left: index === 0 ? '-8px' : `${toPercent(segment.from)}%`,
                    right:
                      index === segments.length - 1
                        ? '-8px'
                        : `${100 - toPercent(segment.to)}%`,
                  }}
                />
              ))}
            </div>
          ) : (
            <BaseSlider.Indicator
              data-slot="slider-indicator"
              className={cn('bg-primary absolute h-full', indicatorClassName)}
            />
          )}
        </BaseSlider.Track>
        {Array.from({ length: thumbCount }, (_, index) => (
          <BaseSlider.Thumb
            key={index}
            index={index}
            getAriaLabel={thumbAriaLabel ?? undefined}
            style={thumbStyle?.(index)}
            className={cn(
              'border-primary-border bg-background ring-primary/40 block size-4 shrink-0 rounded-full border-2 shadow-xs outline-none transition-[box-shadow,border-color] duration-150 hover:ring-[3px] focus-visible:ring-[3px] data-[focus-visible]:ring-[3px] data-[dragging]:border-primary data-[dragging]:ring-[3px] disabled:pointer-events-none disabled:opacity-50',
              thumbClassName
            )}
          />
        ))}
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}

export { Slider };
export type { SliderSegment };
