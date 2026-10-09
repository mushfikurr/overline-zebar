import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@overline-zebar/ui';

export function LauncherNoResults({ query }: { query: string }) {
  return (
    <Empty className="h-full gap-2 p-4">
      <EmptyHeader className="max-w-xs">
        <EmptyTitle className="text-sm">No scripts match “{query}”</EmptyTitle>
        <EmptyDescription>Try a different name or command.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
