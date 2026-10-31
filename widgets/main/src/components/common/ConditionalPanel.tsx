import { springPanel } from '@overline-zebar/ui';
import { AnimatePresence, motion } from 'motion/react';
import useMeasure from 'react-use-measure';
import { cn } from '../../utils/cn';

const collapsed = { width: 0, opacity: 0 };

export function ConditionalPanel({
  children,
  sessionActive,
}: {
  children: React.ReactNode;
  sessionActive: boolean;
}) {
  const [ref, { width }] = useMeasure();

  return (
    <AnimatePresence initial={false}>
      {sessionActive && (
        <motion.div
          key="resizable-panel"
          initial={collapsed}
          animate={{ width: width || 'auto', opacity: 1 }}
          exit={collapsed}
          transition={springPanel}
          className="relative overflow-hidden h-full"
        >
          <div
            className={cn(
              width ? 'absolute' : 'relative',
              'h-full flex items-center'
            )}
            ref={ref}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
