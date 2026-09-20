import * as React from 'react';
import { mergeProps } from '@base-ui-components/react';
import { useRender } from '@base-ui-components/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';
import { Separator } from './separator';

function ItemGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn('group/item-group flex flex-col', className)}
      {...props}
    />
  );
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn('my-0', className)}
      {...props}
    />
  );
}

const itemVariants = cva(
  'group/item flex flex-wrap items-center rounded-md border border-transparent text-sm outline-none transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-out focus-visible:ring-[3px] focus-visible:ring-primary/50 motion-reduce:transition-[background-color,color,border-color,box-shadow]',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'cursor-pointer rounded-lg border-border bg-background hover:border-button-border hover:bg-surface/40 [:active:not(:has(button:active))]:scale-[0.99]',
        muted: 'bg-background-deeper/50',
      },
      size: {
        default: 'gap-4 p-4',
        sm: 'gap-2.5 px-4 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ItemProps
  extends VariantProps<typeof itemVariants>,
    React.HTMLAttributes<HTMLDivElement>,
    useRender.ComponentProps<'div'> {}

const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      render = <div />,
      ...props
    },
    ref
  ) => {
    const defaultProps = {
      ref,
      'data-slot': 'item',
      'data-variant': variant,
      'data-size': size,
      className: cn(itemVariants({ variant, size, className })),
    } as const;

    const element = useRender({
      render,
      props: mergeProps<'div'>(defaultProps, props),
    });

    return element;
  }
);

Item.displayName = 'Item';

const itemMediaVariants = cva(
  'flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "size-8 rounded-sm border border-border bg-background-deeper [&_svg:not([class*='size-'])]:size-4",
        image:
          'size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ItemMediaProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof itemMediaVariants> {}

const ItemMedia = React.forwardRef<HTMLDivElement, ItemMediaProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  )
);

ItemMedia.displayName = 'ItemMedia';

function ItemContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        'flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none',
        className
      )}
      {...props}
    />
  );
}

function ItemTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        'flex w-fit items-center gap-2 text-sm leading-snug font-medium',
        className
      )}
      {...props}
    />
  );
}

function ItemDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        'line-clamp-2 text-text-muted text-sm leading-normal font-normal text-balance',
        className
      )}
      {...props}
    />
  );
}

function ItemActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-actions"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  );
}

function ItemHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        'flex basis-full items-center justify-between gap-2',
        className
      )}
      {...props}
    />
  );
}

function ItemFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        'flex basis-full items-center justify-between gap-2',
        className
      )}
      {...props}
    />
  );
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemHeader,
  ItemFooter,
  ItemGroup,
  ItemSeparator,
  itemVariants,
};
