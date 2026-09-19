import { isLauncherFolder, type LauncherItem } from '@overline-zebar/config';
import { FolderSquare } from '@/components/icons';
import { ScriptItemContent } from './ScriptItemContent';

export function ItemPreview({
  item,
  width,
}: {
  item: LauncherItem;
  width?: number;
}) {
  const isFolder = isLauncherFolder(item);

  return (
    <div
      style={width !== undefined ? { width } : undefined}
      className="bg-surface text-text flex min-w-0 items-center gap-3 rounded-lg border border-border/70 px-3 py-2.5 opacity-90 shadow-xl"
    >
      {isFolder ? (
        <>
          <FolderSquare className="size-9" glyphClassName="size-5" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium leading-none">
            {item.title}
          </span>
        </>
      ) : (
        <div className="pointer-events-none flex min-w-0 flex-1 items-center">
          <ScriptItemContent app={item} />
        </div>
      )}
    </div>
  );
}
