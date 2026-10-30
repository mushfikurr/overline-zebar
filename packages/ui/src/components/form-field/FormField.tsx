import React from 'react';
import { cn } from '../../utils/cn';
import { AlertTriangle, Undo2 } from 'lucide-react';
import { Button } from '../button';

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  switch?: boolean;
  isDefault?: boolean;
  onReset?: () => void;
}

export function FormField({
  children,
  className,
  switch: isSwitch,
  isDefault,
  onReset,
  ...props
}: FormFieldProps) {
  const childrenArray = React.Children.toArray(children);

  const title = childrenArray.find(
    (child) =>
      React.isValidElement(child) &&
      (child.type as React.FunctionComponent).displayName === 'FieldTitle'
  );
  const input = childrenArray.find(
    (child) =>
      React.isValidElement(child) &&
      (child.type as React.FunctionComponent).displayName === 'FieldInput'
  );
  const description = childrenArray.find(
    (child) =>
      React.isValidElement(child) &&
      (child.type as React.FunctionComponent).displayName === 'FieldDescription'
  );

  const showReset = onReset != null && isDefault === false;
  const resetButton = showReset && (
    <FieldReset
      className="absolute left-full top-1/2 ml-2 -translate-y-[calc(50%+1px)]"
      onClick={onReset}
    />
  );

  return (
    <div className={cn(className, !isSwitch && 'space-y-3')} {...props}>
      {isSwitch ? (
        <div className={cn('flex gap-4', !description && 'items-center')}>
          {input}
          <div className="space-y-1.5">
            <div className="relative w-fit">
              <h1 className="leading-none">{title}</h1>
              {resetButton}
            </div>
            {description}
          </div>
        </div>
      ) : showReset && title ? (
        <>
          <div className="relative w-fit">
            {title}
            {resetButton}
          </div>
          {childrenArray.filter((child) => child !== title)}
        </>
      ) : (
        children
      )}
    </div>
  );
}

export function FieldReset({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={className}
      onClick={onClick}
      aria-label="Reset to default"
      title="Reset to default"
    >
      <Undo2 />
    </Button>
  );
}

interface FieldTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function FieldTitle({ children, className, ...props }: FieldTitleProps) {
  return (
    <h3 className={cn('text-text font-medium', className)} {...props}>
      {children}
    </h3>
  );
}
FieldTitle.displayName = 'FieldTitle';

interface FieldInputProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FieldInput({ children, className, ...props }: FieldInputProps) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}
FieldInput.displayName = 'FieldInput';

interface FieldDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  warning?: boolean;
}

export function FieldDescription({
  children,
  className,
  warning,
  ...props
}: FieldDescriptionProps) {
  return (
    <div className={cn('text-text-muted space-y-1', className)} {...props}>
      {warning && (
        <span className="flex items-center gap-2 text-text">
          <AlertTriangle className="text-warning h-4 w-4" strokeWidth={2.5} />
          Only amend if you know what you are doing
        </span>
      )}
      <p>{children}</p>
    </div>
  );
}
FieldDescription.displayName = 'FieldDescription';
