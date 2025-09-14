import { AnimatePresence, HTMLMotionProps, motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import React from 'react';
import { cn } from '../../../utils/cn';

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  animateKey?: string;
  animateProps?: HTMLMotionProps<'div'>;
}

// TODO: Shares same animation as Status. Maybe extract to a component?

export const IconButton = ({
  icon: Icon,
  animateKey,
  animateProps,
  ...props
}: IconButtonProps) => {
  const renderInner = (Icon: LucideIcon) => (
    <Icon className="h-3 w-3" strokeWidth={3} />
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
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.1 }} // 1.1 to mitigate the blurry icon
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
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
