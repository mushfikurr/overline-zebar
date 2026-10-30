import { ReactNode, useEffect, useRef, useState } from 'react';

type Props = {
  title: string;
  description: string;
  separator?: boolean;
  children?: ReactNode;
};

function PanelHeading({
  title,
  description,
  separator = true,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const scope = el.parentElement;
    const tracked = new Set<HTMLElement>();
    const update = () =>
      setScrolled([...tracked].some((scroller) => scroller.scrollTop > 0));

    // Track scroll events from scrollers that share the header's parent
    // (e.g. a scrollable tab content), not just ancestor containers.
    // Scroll events don't bubble, so listen in the capture phase.
    const onScroll = (event: Event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        scope?.contains(target) &&
        !el.contains(target)
      ) {
        tracked.add(target);
        update();
      }
    };

    // Initial state: include an ancestor scroll container if present.
    let container: HTMLElement | null = scope;
    while (container) {
      const { overflowY } = getComputedStyle(container);
      const canScroll =
        (overflowY === 'auto' || overflowY === 'scroll') &&
        container.scrollHeight > container.clientHeight;
      if (canScroll) {
        tracked.add(container);
        break;
      }
      container = container.parentElement;
    }

    document.addEventListener('scroll', onScroll, {
      capture: true,
      passive: true,
    });
    update();

    return () =>
      document.removeEventListener('scroll', onScroll, { capture: true });
  }, []);

  return (
    <div
      ref={ref}
      className="sticky top-0 z-10 bg-surface/75 backdrop-blur-xl transition-shadow duration-300"
      style={{
        boxShadow: scrolled
          ? '0 3px 8px -5px rgba(0,0,0,0.07), 0 12px 24px -12px rgba(0,0,0,0.16)'
          : 'none',
      }}
    >
      <div className="px-4 pt-3 pb-3">
        <h1 className="text-lg font-medium">{title}</h1>
        <p className="text-text-muted">{description}</p>
        {children}
      </div>
      {separator && <div className="h-px bg-text/10" />}
    </div>
  );
}

export default PanelHeading;
