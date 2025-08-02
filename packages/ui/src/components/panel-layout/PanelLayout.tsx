import { cn } from '../../utils/cn';
import React from 'react';

interface PanelLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
}

export default function PanelLayout({
  children,
  className,
  ...props
}: PanelLayoutProps) {
  return (
    <div
      className={cn(
        'p-2 px-2.5 space-y-2 h-full w-full overflow-y-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
