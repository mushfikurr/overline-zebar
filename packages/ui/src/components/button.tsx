'use client';

import * as React from 'react';
import { mergeProps } from '@base-ui-components/react';
import { useRender } from '@base-ui-components/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          'bg-button text-text hover:bg-background/90 active:bg-background focus-visible:border-primary border border-button-border shadow-xs',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs',
        ghost: 'text-text-muted hover:bg-background/80 hover:text-text',
        outline:
          'border bg-transparent text-foreground hover:bg-accent/80 hover:text-accent-foreground shadow-xs',
        link: 'text-foreground hover:underline',
        destructive:
          'bg-button border border-button-border text-text hover:bg-danger/80 focus-visible:ring-danger/50 shadow-xs',
      },
      size: {
        sm: 'h-8 px-3 gap-1',
        md: 'h-9 px-4',
        lg: 'h-10 px-5',
        'icon-sm': "size-8 [&_svg:not([class*='size-'])]:size-3",
        icon: 'size-9',
        'icon-lg': "size-10 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends VariantProps<typeof buttonVariants>,
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    useRender.ComponentProps<'button'> {}

function Button({
  className,
  variant,
  size,
  render = <button />,
  ...props
}: ButtonProps) {
  const defaultProps = {
    'data-slot': 'button',
    className: cn(buttonVariants({ variant, size, className })),
  } as const;

  const element = useRender({
    render,
    props: mergeProps<'button'>(defaultProps, props),
  });

  return element;
}

export { Button, buttonVariants };
