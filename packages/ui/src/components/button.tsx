'use client';

import * as React from 'react';
import { mergeProps } from '@base-ui-components/react';
import { useRender } from '@base-ui-components/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm rounded-md font-medium transition-all duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          'bg-button text-text hover:bg-background/90 active:bg-background focus-visible:border-primary border border-button-border shadow-xs',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs',
        ghost: 'text-text-muted hover:bg-background-deeper hover:text-text',
        outline:
          'border border-button-border/60 hover:border-button-border bg-transparent text-text shadow-xs',
        link: 'text-foreground hover:underline',
        destructive:
          'bg-button border border-button-border text-text hover:bg-danger/80 focus-visible:ring-danger/50 shadow-xs',
      },
      size: {
        sm: 'text-xs py-1 px-2 gap-1',
        md: 'py-1.5 px-2.5',
        lg: 'py-2 px-3',
        'icon-xs': "size-5 [&_svg:not([class*='size-'])]:size-2.5",
        'icon-sm': "size-6 [&_svg:not([class*='size-'])]:size-3",
        icon: 'size-7',
        'icon-lg': "size-8 [&_svg:not([class*='size-'])]:size-3.5",
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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, render = <button />, ...props }, ref) => {
    const defaultProps = {
      ref,
      'data-slot': 'button',
      className: cn(buttonVariants({ variant, size, className })),
    } as const;

    const element = useRender({
      render,
      props: mergeProps<'button'>(defaultProps, props),
    });

    return element;
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
