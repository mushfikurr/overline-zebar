import { sendWidgetAction } from '@overline-zebar/config';
import * as zebar from 'zebar';
import { Button } from '@overline-zebar/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { GlazeWmOutput } from 'zebar';
import { calculateWidgetPlacementFromLeft } from '../utils/calculateWidgetPlacement';
import { cn } from '../utils/cn';

interface TilingControlProps {
  glazewm: GlazeWmOutput | null;
}

export function TilingControl({ glazewm }: TilingControlProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const calculatePlacementFromRef = async () => {
    return await calculateWidgetPlacementFromLeft(buttonRef, {
      width: 400,
      height: 400,
    });
  };

  if (!glazewm) return null;

  const handleOpenAppLauncher = async () => {
    const placement = await calculatePlacementFromRef();
    sendWidgetAction('app-launcher', 'toggle', placement);
  };

  return (
    <>
      <AnimatePresence>
        {glazewm.bindingModes.map((bindingMode) => (
          <motion.div
            key={bindingMode.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            exit={{ opacity: 0 }}
            className="flex items-center h-full"
          >
            <Button>{bindingMode.displayName ?? bindingMode.name}</Button>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button size="icon" ref={buttonRef} onClick={handleOpenAppLauncher}>
        <LayoutGrid strokeWidth={3} className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        onClick={() => glazewm.runCommand('toggle-tiling-direction')}
      >
        <ChevronRight
          className={cn(
            'h-4 w-4 transition-transform duration-200 ease-in-out',
            glazewm.tilingDirection === 'vertical' ? 'rotate-90' : ''
          )}
          strokeWidth={3}
        />
      </Button>
    </>
  );
}
