import * as React from 'react';
import { Select as BaseSelect } from '@base-ui-components/react/select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Select({
  ...props
}: React.ComponentProps<typeof BaseSelect.Root>) {
  return <BaseSelect.Root data-slot="select" {...props} />;
}

export function SelectGroup({
  ...props
}: React.ComponentProps<typeof BaseSelect.Group>) {
  return <BaseSelect.Group data-slot="select-group" {...props} />;
}

function SelectPortal({
  ...props
}: React.ComponentProps<typeof BaseSelect.Portal>) {
  return <BaseSelect.Portal data-slot="select-portal" {...props} />;
}

export function SelectPositioner({
  ...props
}: React.ComponentProps<typeof BaseSelect.Positioner>) {
  return <BaseSelect.Positioner data-slot="select-positioner" {...props} />;
}

export function SelectValue({
  className,
  ...props
}: React.ComponentProps<typeof BaseSelect.Value>) {
  return (
    <BaseSelect.Value
      data-slot="select-value"
      className={cn('text-sm', className)}
      {...props}
    />
  );
}

export function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof BaseSelect.Trigger> & {
  size?: 'sm' | 'default';
}) {
  return (
    <BaseSelect.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "[&_svg:not([class*='text-'])]:text-text-muted text-base hover:text-text hover:bg-button-border active:bg-background focus-visible:border-button-border focus-visible:ring-button-border/50 ring-danger/50 border-danger bg-button flex w-fit items-center justify-between gap-2 rounded-md border border-button-border px-3 py-2 whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none select-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <BaseSelect.Icon>
        <ChevronDownIcon className="size-4 opacity-50" />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  sideOffset = 4,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof BaseSelect.Popup> & {
  sideOffset?: BaseSelect.Positioner.Props['sideOffset'];
  position?: 'popper' | 'item-aligned';
}) {
  return (
    <SelectPortal>
      <SelectPositioner
        sideOffset={sideOffset}
        alignItemWithTrigger={position === 'item-aligned'}
      >
        <SelectScrollUpButton />
        <BaseSelect.Popup
          data-slot="select-content"
          className={cn(
            'bg-background text-text relative z-50 max-h-[var(--available-height)] w-[var(--anchor-width)] min-w-[8rem] origin-[var(--transform-origin)] overflow-x-hidden overflow-y-auto rounded-md border border-border p-1 shadow-md transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            className
          )}
          {...props}
        >
          {children}
        </BaseSelect.Popup>
        <SelectScrollDownButton />
      </SelectPositioner>
    </SelectPortal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseSelect.Item>) {
  return (
    <BaseSelect.Item
      data-slot="select-item"
      className={cn(
        "data-highlighted:bg-primary data-highlighted:text-text hover:bg-button/80 [&_svg:not([class*='text-'])]:text-text-muted relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <BaseSelect.ItemIndicator>
          <CheckIcon className="size-4" />
        </BaseSelect.ItemIndicator>
      </span>
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  );
}

export function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof BaseSelect.GroupLabel>) {
  return (
    <BaseSelect.GroupLabel
      data-slot="select-label"
      className={cn(
        'text-muted-foreground px-2 py-1.5 text-xs font-medium',
        className
      )}
      {...props}
    />
  );
}

export function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof BaseSelect.Separator>) {
  return (
    <BaseSelect.Separator
      data-slot="select-separator"
      className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
}

export function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof BaseSelect.ScrollUpArrow>) {
  return (
    <BaseSelect.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        'bg-background text-text top-px left-[1px] z-[100] flex w-[calc(100%-2px)] cursor-default items-center justify-center rounded-t-md py-1',
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </BaseSelect.ScrollUpArrow>
  );
}

export function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof BaseSelect.ScrollDownArrow>) {
  return (
    <BaseSelect.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        'bg-background text-text bottom-px left-[1px] z-[100] flex w-[calc(100%-2px)] cursor-default items-center justify-center rounded-b-md py-1',
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </BaseSelect.ScrollDownArrow>
  );
}
