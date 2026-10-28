import { motion } from 'motion/react';
import React from 'react';

export function Center({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex gap-3 items-center h-full transition-all ease-in-out"
      layout="position"
    >
      {children}
    </motion.div>
  );
}
