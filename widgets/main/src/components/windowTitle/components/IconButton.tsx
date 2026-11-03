import { iconSwap } from '@overline-zebar/ui';
import { AnimatePresence, HTMLMotionProps, motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import React from 'react';
import { cn } from '../../../utils/cn';

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  animateKey?: string;
  animateProps?: HTMLMotionProps<'div'>;
  static?: boolean;
}

export const IconButton = ({
  icon: Icon,
  animateKey,
  animateProps,
  static: isStatic = false,
  className,
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
        'transition-[color,scale] duration-150 ease-out',
        !isStatic && 'enabled:active:scale-[0.96]',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {animateKey ? (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={animateKey} {...iconSwap} {...animateProps}>
            {renderInner(Icon)}
          </motion.div>
        </AnimatePresence>
      ) : (
        renderInner(Icon)
      )}
    </button>
  );
};
