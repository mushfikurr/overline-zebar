import { cn } from '../../utils/cn';

type DividerProps = React.ComponentPropsWithoutRef<'span'>;

export default function Divider({ className, ...props }: DividerProps) {
  return (
    <span className={cn('w-[1px] h-3 bg-app-border', className)} {...props} />
  );
}
