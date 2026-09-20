import { isLauncherFolder, type LauncherItem } from '@overline-zebar/config';
import { collapseCommandPath } from '../utils/queries';
import { FolderSquare, IconSquare } from './icons';

export function LauncherDragPreview({
  item,
  view,
  width,
  showCommand,
  collapsePath,
}: {
  item: LauncherItem;
  view: 'grid' | 'list' | undefined;
  width?: number;
  showCommand?: boolean;
  collapsePath?: boolean;
}) {
  return view === 'list' ? (
    <RowPreview
      item={item}
      width={width}
      showCommand={showCommand}
      collapsePath={collapsePath}
    />
  ) : (
    <TilePreview item={item} width={width} />
  );
}

function TilePreview({ item, width }: { item: LauncherItem; width?: number }) {
  const isFolder = isLauncherFolder(item);

  return (
    <div
      style={width !== undefined ? { width } : undefined}
      className="bg-surface text-text flex h-[4.75rem] min-w-0 flex-col items-center justify-center gap-2 rounded-md border border-border/70 p-1.5 opacity-90 shadow-xl"
    >
      {isFolder ? (
        <FolderSquare className="size-9" glyphClassName="size-6" />
      ) : (
        <IconSquare app={item} className="size-9" glyphClassName="size-7" />
      )}
      <span className="w-full truncate text-center text-xs">{item.title}</span>
    </div>
  );
}

function RowPreview({
  item,
  width,
  showCommand,
  collapsePath,
}: {
  item: LauncherItem;
  width?: number;
  showCommand?: boolean;
  collapsePath?: boolean;
}) {
  const isFolder = isLauncherFolder(item);
  const command =
    !isFolder && collapsePath
      ? collapseCommandPath(item.command)
      : isFolder
        ? undefined
        : item.command;

  return (
    <div
      style={width !== undefined ? { width } : undefined}
      className="bg-surface text-text flex min-w-0 items-center gap-2.5 rounded-md border border-border/70 py-1.5 pl-[9px] pr-2 text-left opacity-90 shadow-xl"
    >
      {isFolder ? (
        <FolderSquare className="size-6" glyphClassName="size-4" />
      ) : (
        <IconSquare app={item} className="size-6" glyphClassName="size-4" />
      )}
      <span className="min-w-0 flex-1 truncate text-sm leading-none">
        {item.title}
      </span>
      {!isFolder && showCommand && (
        <span className="text-text-muted min-w-0 max-w-[45%] truncate text-xs leading-none translate-y-[1px]">
          {command}
        </span>
      )}
    </div>
  );
}
