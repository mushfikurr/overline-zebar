'use client';

import * as React from 'react';
import { Tooltip as BaseTooltip } from '@base-ui-components/react/tooltip';
import { cn } from '../../utils/cn';

const Tooltip = BaseTooltip.Root;
const TooltipTrigger = BaseTooltip.Trigger;
const TooltipPortal = BaseTooltip.Portal;
const TooltipPositioner = BaseTooltip.Positioner;

const TooltipPopup = React.forwardRef<
  React.ElementRef<typeof BaseTooltip.Popup>,
  React.ComponentPropsWithoutRef<typeof BaseTooltip.Popup>
>(({ className, ...props }, ref) => (
  <BaseTooltip.Popup
    ref={ref}
    className={cn(
      'z-50 max-w-xs rounded border border-border bg-background-deeper px-2 py-1 text-sm text-text shadow-md outline-none',
      'transition-[opacity] duration-150 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0',
      className
    )}
    {...props}
  />
));
TooltipPopup.displayName = 'TooltipPopup';

export {
  Tooltip,
  TooltipTrigger,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
};
