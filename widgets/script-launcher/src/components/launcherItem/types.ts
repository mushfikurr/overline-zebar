import type {
  LauncherCommand,
  LauncherFolder,
  LauncherItem,
} from '@overline-zebar/config';
import type { LauncherDragDelta } from '@/components/dnd';
import type { MouseEvent as ReactMouseEvent } from 'react';

export type LauncherListState = {
  folders: LauncherFolder[];
  selectedIds: string[];
  handlers: ItemHandlers;
  dragEnabled?: boolean;
  dragDelta: LauncherDragDelta;
  showCommand?: boolean;
  collapsePath?: boolean;
};

export type LauncherItemInteraction = {
  isSelected: boolean;
  isDwellTarget: boolean;
  isFolderTarget: boolean;
  isGhostMover: boolean;
  isEnterTarget?: boolean;
};

export type ItemHandlers = {
  onOpenFolder?: (folder: LauncherFolder) => void;
  onEditScript: (script: LauncherCommand) => void;
  onDelete: (id: string) => void;
  onRenameFolder: (folder: LauncherFolder) => void;
  onDeleteFolder: (folder: LauncherFolder) => void;
  onMoveToTopLevel: (id: string) => void;
  onMoveToFolder: (ids: string[], folderId: string) => void;
  onItemClick: (item: LauncherItem, event: ReactMouseEvent) => void;
  onDeleteSelected: (ids: string[]) => void;
  onMoveSelectedOut: (ids: string[]) => void;
  onClearSelection: () => void;
};
