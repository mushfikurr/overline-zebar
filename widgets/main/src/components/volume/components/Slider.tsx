import * as RadixSlider from '@radix-ui/react-slider';
import { motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { ElementRef, useRef, useState } from 'react';

const MAX_OVERFLOW = 50;

export default function Slider({
  value,
  setValue,
}: {
  value: number;
  setValue: (value: number) => void;
}) {
  const ref = useRef<ElementRef<typeof RadixSlider.Root>>(null);
  const [_region, setRegion] = useState('middle');
  const clientX = useMotionValue(0);
  const overflow = useMotionValue(0);

  useMotionValueEvent(clientX, 'change', (latest) => {
    if (ref.current) {
      const { left, right } = ref.current.getBoundingClientRect();
      let newValue;

      if (latest < left) {
        setRegion('left');
        newValue = left - latest;
      } else if (latest > right) {
        setRegion('right');
        newValue = latest - right;
      } else {
        setRegion('middle');
        newValue = 0;
      }

      overflow.jump(decay(newValue, MAX_OVERFLOW));
    }
  });

  return (
    <motion.div className="flex w-[8rem] h-full touch-none select-none items-center justify-center rounded-xl overflow-visible">
      <RadixSlider.Root
        ref={ref}
        value={[value]}
        onValueChange={([v]) => setValue(Math.floor(v))}
        onClick={(e) => e.stopPropagation()}
        step={0.01}
        className="relative flex w-full cursor-grab touch-none select-none rounded-full items-center active:cursor-grabbing"
        onPointerMove={(e) => {
          e.stopPropagation();
          if (e.buttons > 0) {
            clientX.jump(e.clientX);
          }
        }}
        onLostPointerCapture={() => {
          overflow.set(0);
        }}
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
    </motion.div>
  );
}

// Sigmoid-based decay function
function decay(value: number, max: number) {
  if (max === 0) {
    return 0;
  }

  const entry = value / max;
  const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);

  return sigmoid * max;
}
