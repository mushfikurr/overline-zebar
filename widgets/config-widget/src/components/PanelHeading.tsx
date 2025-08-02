type Props = { title: string; description: string };

function PanelHeading({ title, description }: Props) {
  return (
    <>
      <div>
        <h1 className="text-lg">{title}</h1>
        <p className="text-text-muted">{description}</p>
      </div>
      <div className="w-full bg-text/5 h-px my-4 mb-6"></div>
    </>
  );
}

export default PanelHeading;
