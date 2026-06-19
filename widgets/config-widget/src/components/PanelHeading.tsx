import { ReactNode } from 'react';

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
  return (
    <div className="sticky top-0 z-10 bg-background">
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
