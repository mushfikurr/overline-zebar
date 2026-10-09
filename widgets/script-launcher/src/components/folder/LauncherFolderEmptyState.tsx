import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@overline-zebar/ui';
import { Folder } from 'lucide-react';

export function LauncherFolderEmptyState() {
  return (
    <Empty className="h-full gap-2 p-4">
      <EmptyHeader className="max-w-xs">
        <EmptyMedia>
          <Folder className="text-text-muted size-8" strokeWidth={1.5} />
        </EmptyMedia>
        <EmptyTitle className="text-sm">Nothing in this folder yet</EmptyTitle>
        <EmptyDescription className="max-w-xs text-pretty">
          Add a script with the plus below, or drag one onto the folder.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
