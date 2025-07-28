import React from 'react';
import { cn } from '../../utils/cn';
import { LucideIcon } from 'lucide-react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'p-2 border border-border rounded bg-background flex flex-col gap-1.5 w-full',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };

interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  Icon?: LucideIcon;
}

const CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, children, Icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between', className)}
        {...props}
      >
        <h3 className="font-medium text-text-muted">{children}</h3>
        {Icon && <Icon className="h-5 w-5 text-text-muted" />}
      </div>
    );
  }
);

CardTitle.displayName = 'CardTitle';

export { CardTitle };
