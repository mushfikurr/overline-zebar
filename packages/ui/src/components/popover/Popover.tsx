'use client';

import * as React from 'react';
import { Popover as BasePopover } from '@base-ui-components/react';
import { cn } from '../../utils/cn';

const Popover = BasePopover.Root;
const PopoverTrigger = BasePopover.Trigger;
const PopoverPortal = BasePopover.Portal;
const PopoverPositioner = BasePopover.Positioner;

const PopoverPopup = React.forwardRef<
  React.ElementRef<typeof BasePopover.Popup>,
  React.ComponentPropsWithoutRef<typeof BasePopover.Popup>
>(({ className, ...props }, ref) => (
  <BasePopover.Popup
    ref={ref}
    className={cn(
      'z-50 w-72 rounded-md border border-border bg-background p-4 text-text shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
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
