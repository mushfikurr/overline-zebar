import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@overline-zebar/ui';
import { FileCode, Folder } from 'lucide-react';

export function LauncherEmptyState() {
  return (
    <Empty className="h-full gap-2 p-4">
      <EmptyHeader className="max-w-xs">
        <EmptyMedia>
          <FileCode className="text-text-muted size-8" strokeWidth={1.5} />
        </EmptyMedia>
        <EmptyTitle className="text-sm">
          Scripts you add will show up here
        </EmptyTitle>
        <EmptyDescription className="max-w-xs text-pretty">
          These can be .exe paths, AHK scripts you commonly use, or generally
          just any shell command.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function LauncherNoResults({ query }: { query: string }) {
  return (
    <Empty className="h-full gap-2 p-4">
      <EmptyHeader className="max-w-xs">
        <EmptyTitle className="text-sm">
          No scripts match “{query}”
        </EmptyTitle>
        <EmptyDescription>Try a different name or command.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

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
