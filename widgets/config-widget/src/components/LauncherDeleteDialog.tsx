import type { PendingLauncherDelete } from '@overline-zebar/script-launcher';
import { ConfirmDialog } from './common/ConfirmDialog';

export function LauncherDeleteDialog({
  pendingDelete,
  onConfirm,
  onDismiss,
}: {
  pendingDelete: PendingLauncherDelete | null;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  return (
    <ConfirmDialog
      open={pendingDelete !== null}
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
      title={
        pendingDelete?.kind === 'folder'
          ? 'Delete folder'
          : pendingDelete?.kind === 'items'
            ? 'Delete items'
            : 'Delete script'
      }
      description={
        pendingDelete?.kind === 'folder' ? (
          <>
            &ldquo;{pendingDelete.folder.title}&rdquo; will be removed. The
            scripts inside are kept and moved to the top level.
          </>
        ) : pendingDelete?.kind === 'items' ? (
          <>
            This will remove {pendingDelete.ids.length}{' '}
            {pendingDelete.ids.length === 1 ? 'item' : 'items'} from your
            launcher. Scripts inside a removed folder are kept and moved to the
            top level.
          </>
        ) : (
          <>
            This will remove &ldquo;
            {pendingDelete?.app.title || 'Untitled script'}&rdquo; from your
            launcher.
          </>
        )
      }
      confirmLabel="Delete"
      destructive
      onConfirm={onConfirm}
    />
  );
}
