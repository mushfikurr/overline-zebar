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

    let container: HTMLElement | null = el.parentElement;
    while (container) {
      const { overflowY } = getComputedStyle(container);
      const canScroll =
        (overflowY === 'auto' || overflowY === 'scroll') &&
        container.scrollHeight > container.clientHeight;
      if (canScroll) break;
      container = container.parentElement;
    }
    if (!container) return;

    const update = () => setScrolled(container!.scrollTop > 0);
    update();
    container.addEventListener('scroll', update, { passive: true });
    return () => container!.removeEventListener('scroll', update);
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
