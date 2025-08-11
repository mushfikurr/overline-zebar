import {
  animate,
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import React, { ReactElement, useEffect } from 'react';
interface ExpandingCarouselProps {
  items: ReactElement[];
  expanded: boolean;
  visibleCount?: number;
  itemWidth?: number;
  gap?: number;
  fadeEdgeOffset?: number;
  startIndex?: number;
}

const springConfig = {
  type: 'spring',
  stiffness: 150,
  damping: 20,
  mass: 0.8,
};

export const ExpandingCarousel: React.FC<ExpandingCarouselProps> = ({
  items,
  expanded,
  visibleCount = 4,
  itemWidth = 128,
  gap = 8,
  fadeEdgeOffset = 10,
  startIndex: customStartIndex,
}) => {
  const totalItems = items.length;
  const fullWidth = totalItems * itemWidth + (totalItems - 1) * gap;
  const visibleWidth = visibleCount * itemWidth + (visibleCount - 1) * gap;
  const startIndex =
    customStartIndex ??
    Math.max(0, Math.floor((totalItems - visibleCount) / 2));
  const initialOffset = -(startIndex * (itemWidth + gap));

  const leftEdge = fadeEdgeOffset + '%';
  const rightEdge = 100 - fadeEdgeOffset + '%';
  const edgeOpacity = useMotionValue(1);
  const edgeColor = useTransform(edgeOpacity, (val) => `rgba(0,0,0,${val})`);
  const gradient = useMotionTemplate`linear-gradient(to right, ${edgeColor} 0%, black ${leftEdge}, black ${rightEdge}, ${edgeColor} 100%)`;
  useEffect(() => {
    animate(edgeOpacity, expanded ? 1 : 0.3, { duration: 1.4 });
  }, [expanded]);

  return (
    <div className="w-full flex justify-center items-center">
      <motion.div
        className="relative overflow-hidden"
        initial={false}
        animate={{ width: expanded ? fullWidth : visibleWidth }}
        style={{
          WebkitMaskImage: gradient,
          maskImage: gradient,
          WebkitMaskSize: '100% 100%',
          WebkitMaskRepeat: 'no-repeat',
          maskSize: '100% 100%',
          maskRepeat: 'no-repeat',
        }}
        transition={springConfig}
      >
        <motion.div
          className="flex"
          initial={false}
          style={{ gap: `${gap}px` }}
          animate={{ x: expanded ? 0 : initialOffset }}
          transition={springConfig}
          layout
        >
          <AnimatePresence mode="sync">
            {items.map((item, index) => (
              <motion.div
                key={item.key}
                layout
                className="flex items-center flex-shrink-0"
                style={{ width: itemWidth }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  ...springConfig,
                  delay: index * 0.08,
                  layout: {
                    type: 'spring',
                    stiffness: 320,
                    damping: 20,
                    mass: 0.4,
                  },
                }}
              >
                {item}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};
