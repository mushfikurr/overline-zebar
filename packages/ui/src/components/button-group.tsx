import * as React from 'react';
import { mergeProps } from '@base-ui-components/react';
import { useRender } from '@base-ui-components/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const buttonGroupVariants = cva(
  'flex w-fit items-stretch outline-none has-[>[data-slot=button-group]]:gap-2 [&>input]:flex-1 [&>*:focus-visible]:relative [&>*:focus-visible]:z-10',
  {
    variants: {
      orientation: {
        horizontal:
          '[&>[data-slot]]:rounded-r-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-md [&>[data-slot]~[data-slot]]:rounded-l-none [&>[data-slot]~[data-slot]]:-ml-px',
        vertical:
          'flex-col [&>[data-slot]]:rounded-b-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-md [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]~[data-slot]]:-mt-px',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
);

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  );
}

function ButtonGroupText({
  className,
  render,
  ...props
}: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(
          'flex items-center gap-1.5 rounded-md border border-border bg-background-deeper px-2.5 text-sm font-medium text-text-muted [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-3.5',
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: 'button-group-text',
    },
  });
}

function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<'div'> & {
  orientation?: 'horizontal' | 'vertical';
}) {
  return (
    <div
      role="none"
      data-slot="button-group-separator"
      aria-orientation={orientation}
      className={cn(
        'bg-border shrink-0 self-stretch data-[orientation=vertical]:w-px data-[orientation=horizontal]:h-px',
        className
      )}
      {...props}
    />
  );
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
};
