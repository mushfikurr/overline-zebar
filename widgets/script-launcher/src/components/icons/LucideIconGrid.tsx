import { Skeleton } from '@overline-zebar/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { searchLucideIcons, useLucideIcon } from './lucide-icons';
import { cn } from '../../utils/cn';

const BATCH_SIZE = 96;

function GridIcon({
  name,
  selected,
  onSelect,
}: {
  name: string;
  selected: boolean;
  onSelect: (name: string) => void;
}) {
  const Icon = useLucideIcon(name);

  return (
    <button
      type="button"
      title={name}
      aria-label={name}
      aria-pressed={selected}
      onClick={() => onSelect(name)}
      className={cn(
        'rounded-sm flex size-8 items-center justify-center outline-none transition-[background-color,color,box-shadow] duration-150 ease-out focus-visible:ring-primary/50 focus-visible:ring-[3px] active:scale-[0.96]',
        selected
          ? 'bg-primary/25 text-text ring-1 ring-primary-border'
          : 'text-text-muted hover:bg-button hover:text-text'
      )}
    >
      {Icon ? (
        <Icon className="size-4" strokeWidth={1.75} />
      ) : (
        <Skeleton className="size-4 rounded-sm" />
      )}
    </button>
  );
}

interface LucideIconGridProps {
  query: string;
  selectedName?: string;
  onSelect: (name: string) => void;
}

export function LucideIconGrid({
  query,
  selectedName,
  onSelect,
}: LucideIconGridProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [gridMountCount, setGridMountCount] = useState(0);

  const attachScrollRef = useCallback((node: HTMLDivElement | null) => {
    scrollRef.current = node;
    setGridMountCount((count) => count + 1);
  }, []);

  const attachSentinelRef = useCallback((node: HTMLDivElement | null) => {
    sentinelRef.current = node;
    setGridMountCount((count) => count + 1);
  }, []);

  const names = useMemo(() => searchLucideIcons(query), [query]);
  const visibleNames = names.slice(0, visibleCount);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) => count + BATCH_SIZE);
        }
      },
      { root, rootMargin: '64px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [gridMountCount]);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [query]);

  return (
    <div
      ref={attachScrollRef}
      className="border-border bg-background-deeper h-40 shrink-0 overflow-y-auto rounded-lg border p-1"
    >
      {names.length === 0 ? (
        <p className="text-text-muted p-4 text-center text-sm">
          No icons match “{query}”.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] gap-1">
          {visibleNames.map((name) => (
            <GridIcon
              key={name}
              name={name}
              selected={name === selectedName}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
      <div ref={attachSentinelRef} style={{ height: 1 }} />
    </div>
  );
}
