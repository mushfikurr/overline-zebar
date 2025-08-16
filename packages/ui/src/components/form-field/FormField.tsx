import React from 'react';
import { cn } from '../../utils/cn';
import { AlertTriangle } from 'lucide-react';

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  switch?: boolean;
}

export function FormField({
  children,
  className,
  switch: isSwitch,
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

  return (
    <div className={cn(className, !isSwitch && 'space-y-3')} {...props}>
      {isSwitch ? (
        <div className={cn('flex gap-4', !description && 'items-center')}>
          {input}
          <div className="space-y-1.5">
            <h1 className="leading-none">{title}</h1>
            {description}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
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
          <AlertTriangle className="text-warning h-5 w-5" strokeWidth={2.5} />
          Only amend if you know what you are doing
        </span>
      )}
      <p>{children}</p>
    </div>
  );
}
FieldDescription.displayName = 'FieldDescription';
