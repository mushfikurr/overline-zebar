import { AnimatePresence, MotionProps, motion } from 'framer-motion';
import React from 'react';
import { cn } from '../../../utils/cn';
import useMeasure from 'react-use-measure';
import { useWidgetSetting } from '@overline-zebar/config';

export function TitleDetails({
  title,
  artist,
}: {
  title: string | null | undefined;
  artist: string | null | undefined;
}) {
  const artistKey = artist ?? undefined;
  const titleKey = title ?? undefined;
  const [artistRef, { width: artistWidth }] = useMeasure();
  const [titleRef, { width: titleWidth }] = useMeasure();
  // This allows us to truncate the longer of the two fully, to fit in the max width.
  // i.e. REALLY_LONG_ARTIS... - title
  // artist - REALLY_LONG_TI...
  const [truncateArtist, setTruncateArtist] = React.useState<boolean | null>(
    null
  );

  const [mediaMaxWidth] = useWidgetSetting('main', 'mediaMaxWidth');

  React.useEffect(() => {
    if (artistWidth === 0 || titleWidth === 0) return;
    if (Math.abs(artistWidth - titleWidth) < 2) return;

    setTruncateArtist(artistWidth > titleWidth);
  }, [artistWidth, titleWidth]);

  return (
    <div
      style={mediaMaxWidth ? { maxWidth: `${mediaMaxWidth}px` } : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 cursor-pointer outline-none'
      )}
    >
      <AnimatePresence mode="popLayout">
        <div
          className={cn(
            truncateArtist === null
              ? 'flex-shrink-0' // Initial safe default
              : truncateArtist
                ? 'flex-grow min-w-0'
                : 'flex-shrink-0'
          )}
        >
          <MotionText key={artistKey} ref={artistRef} className="truncate">
            {artist}
          </MotionText>
        </div>
      </AnimatePresence>

      {artist && title && <p className="flex-shrink-0">-</p>}

      <AnimatePresence mode="popLayout">
        <div
          className={cn(
            truncateArtist === null
              ? 'flex-shrink-0'
              : !truncateArtist
                ? 'flex-grow min-w-0'
                : 'flex-shrink-0'
          )}
        >
          <MotionText key={titleKey} ref={titleRef} className="truncate">
            {title}
          </MotionText>
        </div>
      </AnimatePresence>
    </div>
  );
}

const defaultExpansionTransition: MotionProps['transition'] = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

const MotionText = React.forwardRef<
  HTMLParagraphElement,
  {
    children: React.ReactNode;
    className?: string;
    transition?: MotionProps['transition'];
  } & MotionProps
>(
  (
    { children, className, transition = defaultExpansionTransition, ...props },
    ref
  ) => {
    return (
      <motion.p
        ref={ref}
        className={cn('whitespace-nowrap overflow-hidden', className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ ...transition, opacity: { duration: 0.3 } }}
        {...props}
      >
        {children}
      </motion.p>
    );
  }
);
