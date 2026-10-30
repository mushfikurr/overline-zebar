import type { HTMLMotionProps, Transition } from 'motion/react';

export type SwapAnimation = Pick<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'exit' | 'transition'
>;

export const iconSwap: SwapAnimation = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.16, ease: [0.23, 1, 0.32, 1] },
};

export const quickSwap: SwapAnimation = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.12, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.08, ease: [0.23, 1, 0.32, 1] },
  },
};

export const iconFeedback: Pick<
  HTMLMotionProps<'div'>,
  'whileHover' | 'whileTap'
> = {
  whileTap: { scale: 0.97 },
};

export const textSwap: SwapAnimation = {
  initial: { opacity: 0, y: -2 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 2 },
  transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] },
};

export const fadeSwap: SwapAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] },
};

export const springPanel: Transition = {
  type: 'spring',
  stiffness: 120,
  damping: 20,
  mass: 0.8,
};

export const springLayout: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};
