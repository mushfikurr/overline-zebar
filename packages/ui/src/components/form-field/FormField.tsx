import React from 'react';
import { cn } from '../../utils/cn';

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
    <div
      className={cn(isSwitch ? 'space-y-2' : 'space-y-2', className)}
      {...props}
    >
      {isSwitch ? (
        <>
          <div className="flex items-center justify-between">
            {title}
            {input}
          </div>
          {description}
        </>
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
}

export function FieldDescription({
  children,
  className,
  ...props
}: FieldDescriptionProps) {
  return (
    <p className={cn('text-text-muted text-sm', className)} {...props}>
      {children}
    </p>
  );
}
FieldDescription.displayName = 'FieldDescription';
