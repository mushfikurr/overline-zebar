import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@overline-zebar/ui';
import { FileCode } from 'lucide-react';
import { LauncherNoResults } from '@/components/searchBar';
import { LauncherFolderEmptyState } from '@/components/folder';

function LauncherEmptyState() {
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

export function LauncherItemsEmptyState({
  hasApplications,
  hasVisibleItems,
  isSearching,
  query,
  inFolder,
}: {
  hasApplications: boolean;
  hasVisibleItems: boolean;
  isSearching: boolean;
  query: string;
  inFolder: boolean;
}) {
  if (!hasApplications) return <LauncherEmptyState />;
  if (hasVisibleItems) return null;
  if (isSearching) return <LauncherNoResults query={query} />;
  if (inFolder) return <LauncherFolderEmptyState />;
  return null;
}
