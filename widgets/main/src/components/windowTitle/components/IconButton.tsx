import { iconFeedback, iconSwap } from '@overline-zebar/ui';
import { AnimatePresence, HTMLMotionProps, motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import React from 'react';
import { cn } from '../../../utils/cn';

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  animateKey?: string;
  animateProps?: HTMLMotionProps<'div'>;
}

export const IconButton = ({
  icon: Icon,
  animateKey,
  animateProps,
  ...props
}: IconButtonProps) => {
  const renderInner = (Icon: LucideIcon) => (
    <Icon className="h-3.5 w-3.5" strokeWidth={3} />
  );

  return (
    <button
      className={cn(
        'h-full flex items-center justify-center text-icon',
        'hover:text-text',
        'transition-colors duration-200 ease-in-out'
      )}
      {...props}
    >
      {animateKey ? (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={animateKey}
            {...iconSwap}
            {...iconFeedback}
            {...animateProps}
          >
            {renderInner(Icon)}
          </motion.div>
        </AnimatePresence>
      ) : (
        renderInner(Icon)
      )}
    </button>
  );
};
