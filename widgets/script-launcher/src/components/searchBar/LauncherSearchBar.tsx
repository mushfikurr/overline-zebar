import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@overline-zebar/ui';
import { X } from 'lucide-react';

export function LauncherSearchBar({
  hasApplications,
  query,
  resultCount,
  isSearching,
  onQueryChange,
  onSubmit,
}: {
  hasApplications: boolean;
  query: string;
  resultCount: number;
  isSearching: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
}) {
  if (!hasApplications) return null;

  return (
    <div className="bg-surface flex shrink-0 items-center p-2 pb-0.5">
      <InputGroup>
        <InputGroupInput
          className="px-2"
          placeholder="Search scripts..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' || resultCount === 0) return;
            onSubmit();
          }}
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
        <ClearSearchButton query={query} onClear={() => onQueryChange('')} />
      </InputGroup>
      <span role="status" className="sr-only">
        <SearchStatusText
          isSearching={isSearching}
          resultCount={resultCount}
          query={query}
        />
      </span>
    </div>
  );
}

function ClearSearchButton({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  if (!query) return null;

  return (
    <InputGroupAddon align="inline-end">
      <InputGroupButton
        size="icon-xs"
        aria-label="Clear search"
        title="Clear (Esc)"
        onClick={onClear}
      >
        <X />
      </InputGroupButton>
    </InputGroupAddon>
  );
}

function SearchStatusText({
  isSearching,
  resultCount,
  query,
}: {
  isSearching: boolean;
  resultCount: number;
  query: string;
}) {
  if (!isSearching) return null;
  if (resultCount === 0) return `No scripts match ${query}`;
  return `${resultCount} ${resultCount === 1 ? 'result' : 'results'}`;
}
