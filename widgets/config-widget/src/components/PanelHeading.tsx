type Props = { title: string; description: string; separator?: boolean };

function PanelHeading({ title, description, separator = true }: Props) {
  return (
    <>
      <div>
        <h1 className="text-lg font-medium">{title}</h1>
        <p className="text-text-muted">{description}</p>
      </div>
      {separator && <div className="w-full bg-text/10 h-px my-4 mb-6"></div>}
    </>
  );
}

export default PanelHeading;
