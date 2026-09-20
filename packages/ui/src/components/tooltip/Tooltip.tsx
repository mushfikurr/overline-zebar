import * as React from 'react';
import { Tooltip as BaseTooltip } from '@base-ui-components/react/tooltip';
import { cn } from '../../utils/cn';

const Tooltip = BaseTooltip.Root;
const TooltipTrigger = BaseTooltip.Trigger;
const TooltipPortal = BaseTooltip.Portal;

// Same stacking-context rule as Popover: the z must live on the positioner
// (floating-ui's transform traps popup z-index inside it).
const TooltipPositioner = React.forwardRef<
  React.ElementRef<typeof BaseTooltip.Positioner>,
  React.ComponentPropsWithoutRef<typeof BaseTooltip.Positioner>
>(({ className, ...props }, ref) => (
  <BaseTooltip.Positioner
    ref={ref}
    className={cn('z-[9999]', className)}
    {...props}
  />
));
TooltipPositioner.displayName = BaseTooltip.Positioner.displayName;

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
