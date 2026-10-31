import { motion } from 'motion/react';
import React from 'react';
import type { MotionProps } from 'motion/react';

// Recentering on a width change moves as one piece with WindowTitle's
// measured-width tween — same ease and duration, no spring tail.
const layoutTransition: MotionProps['transition'] = {
  layout: { duration: 0.26, ease: [0.23, 1, 0.32, 1] },
};

export function Center({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex gap-3 items-center h-full"
      layout="position"
      transition={layoutTransition}
    >
      {children}
    </motion.div>
  );
}
