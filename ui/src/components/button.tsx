import { cn } from '../utils/cn';

export const buttonStyles = `bg-button border-button-border text-text-muted border px-2.5 rounded-md drop-shadow-md h-full
   hover:bg-button-border hover:text-text
   active:bg-background
   transition-colors ease-in-out duration-200
  `;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonStyles, className)} {...props}>
      {children}
    </button>
  );
}
