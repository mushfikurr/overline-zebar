import {
  panelEnterTransition,
  panelExitTransition,
  panelReveal,
  contentAppearance,
} from '@overline-zebar/ui';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import useMeasure from 'react-use-measure';
import { cn } from '../../utils/cn';

const collapsed = { width: 0, opacity: 0 };

export function ConditionalPanel({
  children,
  sessionActive,
  subtleExit = false,
  appearance = false,
}: {
  children: React.ReactNode;
  sessionActive: boolean;
  subtleExit?: boolean;
  appearance?: boolean;
}) {
  const [ref, { width }] = useMeasure();
  const reduceMotion = useReducedMotion();
  const animateContent = (subtleExit || appearance) && !reduceMotion;
  const contentAnimation = appearance ? contentAppearance : panelReveal;
  const enterTransition = reduceMotion ? { duration: 0 } : panelEnterTransition;
  const exitTransition = reduceMotion ? { duration: 0 } : panelExitTransition;

  return (
    <AnimatePresence initial={false}>
      {sessionActive && (
        <motion.div
          key="resizable-panel"
          initial={animateContent ? { width: 0, opacity: 1 } : collapsed}
          animate={{ width: width || 'auto', opacity: 1 }}
          exit={
            animateContent
              ? {
                  width: 0,
                  opacity: 1,
                  transition: exitTransition,
                }
              : { ...collapsed, transition: exitTransition }
          }
          transition={enterTransition}
          className="relative overflow-hidden h-full"
        >
          <motion.div
            {...(animateContent ? contentAnimation : {})}
            className={cn(
              width ? 'absolute' : 'relative',
              'h-full flex items-center'
            )}
            ref={ref}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
