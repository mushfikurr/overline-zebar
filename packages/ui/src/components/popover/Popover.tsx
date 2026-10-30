'use client';

import * as React from 'react';
import { Popover as BasePopover } from '@base-ui-components/react';
import { cn } from '../../utils/cn';

const Popover = BasePopover.Root;
const PopoverTrigger = BasePopover.Trigger;
const PopoverPortal = BasePopover.Portal;

// The positioner gets floating-ui's translate transform, which creates a
// stacking context — a z-index on the popup alone is trapped inside it and
// loses to dialogs (z-50). Keep the z on the positioner, like Select does.
const PopoverPositioner = React.forwardRef<
  React.ElementRef<typeof BasePopover.Positioner>,
  React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>
>(({ className, ...props }, ref) => (
  <BasePopover.Positioner
    ref={ref}
    className={cn('z-[9999]', className)}
    {...props}
  />
));
PopoverPositioner.displayName = BasePopover.Positioner.displayName;

const PopoverPopup = React.forwardRef<
  React.ElementRef<typeof BasePopover.Popup>,
  React.ComponentPropsWithoutRef<typeof BasePopover.Popup>
>(({ className, ...props }, ref) => (
  <BasePopover.Popup
    ref={ref}
    className={cn(
      'z-[9999] w-72 rounded-md border border-border bg-surface/75 p-4 text-text shadow-md outline-none backdrop-blur-2xl origin-[var(--transform-origin)] transition-[transform,opacity] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0',
      className
    )}
    {...props}
  />
));
PopoverPopup.displayName = BasePopover.Popup.displayName;

export {
  Popover,
  PopoverTrigger,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
};
