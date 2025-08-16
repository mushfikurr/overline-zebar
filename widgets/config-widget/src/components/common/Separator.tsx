type SeparatorProps = {
  separator?: boolean;
};

export function Separator({ separator = true }: SeparatorProps) {
  return separator ? <div className="w-full bg-text/5 h-px my-4 mb-6"></div> : null;
}
