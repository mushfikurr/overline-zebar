import type { ReactNode } from 'react';

export function DragStackOverlay({
  count,
  children,
}: {
  count: number | null;
  children: ReactNode;
}) {
  const stacked = count !== null && count > 1;

  return (
    <div className="relative">
      {stacked && (
        <>
          <div
            aria-hidden
            className="bg-surface absolute inset-0 translate-x-2 translate-y-2 rounded-md border border-border/70 opacity-40 shadow-xl"
          />
          <div
            aria-hidden
            className="bg-surface absolute inset-0 translate-x-1 translate-y-1 rounded-md border border-border/70 opacity-70 shadow-xl"
          />
        </>
      )}
      {children}
      {stacked && (
        <span className="bg-primary animate-in fade-in zoom-in-75 duration-150 motion-reduce:animate-none pointer-events-none absolute -top-2 -right-2 z-10 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-xs font-semibold leading-none text-white shadow-md">
          {count}
        </span>
      )}
    </div>
  );
}
