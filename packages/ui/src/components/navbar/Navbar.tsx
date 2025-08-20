import { Button } from '../button';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface NavbarItemProps {
  Icon: LucideIcon;
  title?: string;
  href: string;
  location: string;
  navigate: (href: string) => void;
  className?: string;
  iconClassNames?: string;
}

export function NavbarItem({
  Icon,
  title,
  href,
  location,
  navigate,
  className,
  iconClassNames,
}: NavbarItemProps) {
  const handleClick = () => {
    navigate(href);
  };

  return (
    <Button
      onClick={handleClick}
      className={cn(
        'group max-h-10 justify-start text-base gap-2 bg-transparent hover:bg-background-deeper/60 h-full px-4 border-none border-b border-button-border rounded-none text-text-muted hover:text-text last:border-b-0',
        location === href &&
          'text-text bg-background-deeper hover:bg-background-deeper',
        className
      )}
    >
      <Icon
        strokeWidth={2.6}
        className={cn(
          'h-5 w-5 text-icon group-hover:text-text transition-colors ease-in-out duration-200',
          location === href && 'text-text group-hover:text-text',
          iconClassNames
        )}
      />
      {title && title}
    </Button>
  );
}

export interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

export function Navbar({ children, className }: NavbarProps) {
  return (
    <div
      className={cn(
        'h-full border-r border-border rounded-tl rounded-bl flex flex-col overflow-clip',
        className
      )}
    >
      {children}
    </div>
  );
}
