import type { HTMLMotionProps, Transition } from 'motion/react';

export type SwapAnimation = Pick<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'exit' | 'transition'
>;

// Shared rhythm: reveals take a little longer than exits, without a pause.
export const panelEnterTransition: Transition = {
  type: 'spring',
  duration: 0.32,
  bounce: 0,
};

export const panelExitTransition: Transition = {
  ...panelEnterTransition,
  duration: 0.26,
};

export const panelReveal: SwapAnimation = {
  initial: { opacity: 0, x: -12, filter: 'blur(4px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: {
    opacity: 0,
    x: -4,
    filter: 'blur(4px)',
    transition: panelExitTransition,
  },
  transition: panelEnterTransition,
};

export const contentAppearance: SwapAnimation = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -2, transition: panelExitTransition },
  transition: panelEnterTransition,
};

export const iconSwap: SwapAnimation = {
  initial: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
  transition: { type: 'spring', duration: 0.3, bounce: 0 },
};

export const quickSwap: SwapAnimation = iconSwap;

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
