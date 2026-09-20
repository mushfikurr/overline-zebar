import type { PendingLauncherDelete } from '@/hooks/useLauncherApplications';
import { ConfirmDialog } from './components/ConfirmDialog';

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
      title={pendingDelete && <DeleteTitle pending={pendingDelete} />}
      description={pendingDelete && <DeleteDescription pending={pendingDelete} />}
      confirmLabel="Delete"
      destructive
      onConfirm={onConfirm}
    />
  );
}

function DeleteTitle({ pending }: { pending: PendingLauncherDelete }) {
  if (pending.kind === 'folder') return 'Delete folder';
  if (pending.kind === 'items') return 'Delete items';
  return 'Delete script';
}

function DeleteDescription({ pending }: { pending: PendingLauncherDelete }) {
  if (pending.kind === 'folder') {
    return (
      <>
        “{pending.folder.title}” will be removed. The scripts inside are kept
        and moved to the top level.
      </>
    );
  }

  if (pending.kind === 'items') {
    return (
      <>
        This will remove {pending.ids.length}{' '}
        {pending.ids.length === 1 ? 'item' : 'items'} from your launcher.
        Scripts inside a removed folder are kept and moved to the top level.
      </>
    );
  }

  return (
    <>
      This will remove “{pending.app.title || 'Untitled script'}” from your
      launcher.
    </>
  );
}
