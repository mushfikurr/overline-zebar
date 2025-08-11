import { cn } from '@/utils/cn';
import { AnimatePresence, HTMLMotionProps, motion } from 'framer-motion';
import { Check, Clipboard, LucideIcon } from 'lucide-react';
import React, { useState } from 'react';

interface CopyToClipboardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  textToCopy?: string | null;
}
export function CopyToClipboard({
  className,
  textToCopy,
  children,
  ...props
}: CopyToClipboardProps) {
  const [copying, setCopying] = useState(false);

  if (!textToCopy) return;

  const handleClipboardCopy = () => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        console.log(`Copied to clipboard: ${textToCopy}`);
        setCopying(true);
        setTimeout(() => setCopying(false), 750);
      })
      .catch((err) => {
        console.error('Failed to copy text to clipboard:', err);
      });
  };

  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      {children}
      <IconButton
        animateKey={copying ? 'copying' : 'not-copying'}
        title={'Copy to clipboard'}
        onClick={handleClipboardCopy}
        icon={copying ? Check : Clipboard}
      />
    </div>
  );
}

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  animateKey?: string;
  animateProps?: HTMLMotionProps<'div'>;
}

// TODO: Shares same animation as Status. Maybe extract to a component?

const IconButton = ({
  icon: Icon,
  animateKey,
  animateProps,
  ...props
}: IconButtonProps) => {
  const renderInner = (Icon: LucideIcon) => (
    <Icon className="h-4 w-4" strokeWidth={3} />
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
