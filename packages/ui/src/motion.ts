import type { HTMLMotionProps, Transition } from 'motion/react';

export type SwapAnimation = Pick<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'exit' | 'transition'
>;

export const iconSwap: SwapAnimation = {
  initial: { opacity: 0, scale: 0.65 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.65 },
  transition: { duration: 0.12, ease: 'easeOut' },
};

export const iconFeedback: Pick<HTMLMotionProps<'div'>, 'whileHover' | 'whileTap'> = {
  whileHover: { scale: 1.1 },
  whileTap: { scale: 0.9 },
};

export const textSwap: SwapAnimation = {
  initial: { opacity: 0, y: -3 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 3 },
  transition: { duration: 0.15, ease: 'easeInOut' },
};

export const fadeSwap: SwapAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15, ease: 'easeInOut' },
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
