import * as React from 'react';
import { AlertDialog as BaseAlertDialog } from '@base-ui-components/react';
import { cn } from '../utils/cn';
import { Button } from './button';

function AlertDialog({
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Root>) {
  return <BaseAlertDialog.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Trigger>) {
  return (
    <BaseAlertDialog.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Portal>) {
  return <BaseAlertDialog.Portal data-slot="alert-dialog-portal" {...props} />;
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Backdrop>) {
  return (
    <BaseAlertDialog.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        'fixed inset-0 bg-background-deeper/80 transition-opacity duration-200 [&[data-ending-style]]:opacity-0 [&[data-starting-style]]:opacity-0',
        className
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  children,
  size = 'default',
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Popup> & {
  size?: 'default' | 'sm';
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <BaseAlertDialog.Popup
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          'bg-surface/75 border border-border text-text fixed z-50 grid w-full sm:max-w-[calc(100%-2rem)] backdrop-blur-2xl',
          'group/alert-dialog-content gap-4 rounded-lg border p-6 shadow-lg transition-[transform,opacity] duration-200 outline-none',
          'fixed bottom-0 w-full sm:top-[50%] sm:bottom-auto sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]',
          'data-[starting-style]:translate-y-full data-[starting-style]:opacity-0',
          'data-[ending-style]:translate-y-full data-[ending-style]:opacity-0',
          'data-[starting-style]:sm:translate-y-[-50%] data-[starting-style]:sm:scale-95',
          'data-[ending-style]:sm:translate-y-[-50%] data-[ending-style]:sm:scale-95',
          size === 'sm' ? 'sm:max-w-sm' : 'sm:max-w-lg',
          className
        )}
        {...props}
      >
        {children}
      </BaseAlertDialog.Popup>
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        'group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2',
        className
      )}
      {...props}
    />
  );
}

function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn('flex justify-center sm:justify-start', className)}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Title>) {
  return (
    <BaseAlertDialog.Title
      data-slot="alert-dialog-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Description>) {
  return (
    <BaseAlertDialog.Description
      data-slot="alert-dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="alert-dialog-action"
      className={cn(className)}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  variant = 'outline',
  size = 'md',
  ...props
}: React.ComponentProps<typeof BaseAlertDialog.Close> &
  Pick<React.ComponentProps<typeof Button>, 'variant' | 'size'>) {
  return (
    <BaseAlertDialog.Close
      data-slot="alert-dialog-cancel"
      className={className}
      render={<Button variant={variant} size={size} />}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
