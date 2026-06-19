import { cn } from '../../utils/cn';
import React from 'react';

interface PanelLayoutProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function PanelLayout({
  children,
  className,
  ...props
}: PanelLayoutProps) {
  return (
    <div
      className={cn('h-full w-full grow overflow-y-auto min-h-0', className)}
      {...props}
    >
      {children}
    </div>
  );
}
