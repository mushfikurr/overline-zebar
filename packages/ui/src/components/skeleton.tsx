import { cn } from '../utils/cn';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-button', className)}
      {...props}
    />
  );
}

export { Skeleton };
