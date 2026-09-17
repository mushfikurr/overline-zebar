import { isLauncherFolder, useWidgetSetting } from '@overline-zebar/config';
import type {
  LauncherCommand,
  LauncherFolder,
  LauncherItem,
} from '@overline-zebar/config';
import {
  UpdateFolderModal,
  UpdateScriptModal,
} from '@overline-zebar/config-widget';
import {
  FolderSquare,
  IconSquare,
} from '@overline-zebar/config-widget/src/components/icons';
import { isFileDialogActive } from '@overline-zebar/config-widget/src/utils/fileDialogGuard';
import { generateId } from '@overline-zebar/config/src/utils/generateId';
import { logger } from '@overline-zebar/config/src/utils/logger';
import {
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@overline-zebar/ui';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Check,
  ChevronLeft,
  FilePlus2,
  Folder,
  FolderOutput,
  FolderPlus,
  Plus,
  Search,
  Settings,
  Trash2,
  X,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import * as zebar from 'zebar';

const providers = zebar.createProviderGroup({
  glazewm: { type: 'glazewm' },
});

/** Shared interaction tokens so tiles, rows, and footer buttons feel
 * identical: quick hover, tactile press. */
const interactive =
  'outline-none transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-out focus-visible:ring-[3px] focus-visible:ring-primary/50';

const ITEM_SELECTOR = '[data-launcher-item]';

/**
 * How long a script must dwell on another item before the folder action
 * commits (join an existing folder / create a new one). Matches Apple's
 * spring-loading guidance: highlight instantly, commit after roughly half
 * a second — long enough to not fire mid-pass, short enough to feel
 * responsive.
 */
const FOLDER_HOVER_DELAY = 600;

/** Droppable id of the folder header; dropping on it moves a script out
 * of the current folder. */
const ROOT_DROP_ID = 'launcher-root-drop';

type FrozenRect = { left: number; top: number; right: number; bottom: number };

type ItemHandlers = {
  onOpenFolder: (folder: LauncherFolder) => void;
  onEditScript: (script: LauncherCommand) => void;
  onDelete: (id: string) => void;
  onRenameFolder: (folder: LauncherFolder) => void;
  onDeleteFolder: (folder: LauncherFolder) => void;
  onMoveToTopLevel: (id: string) => void;
  onItemClick: (item: LauncherItem, event: ReactMouseEvent) => void;
  onDeleteSelected: (ids: string[]) => void;
  onMoveSelectedOut: (ids: string[]) => void;
  onClearSelection: () => void;
};

function App() {
  const [output, setOutput] = useState(providers.outputMap);
  const [applications, setApplications] = useWidgetSetting(
    'script-launcher',
    'applications'
  );
  const [view] = useWidgetSetting('script-launcher', 'view');
  const [showCommands] = useWidgetSetting('script-launcher', 'showCommands');
  const [collapsePaths] = useWidgetSetting('script-launcher', 'collapsePaths');
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newApp, setNewApp] = useState<LauncherCommand>({
    id: '',
    title: '',
    command: '',
    args: [],
  });
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeRect, setActiveRect] = useState<{
    width: number;
    height: number;
  } | null>(null);
  /** Item currently dwelled on with the dwell timer running (soft ring). */
  const [dwellTargetId, setDwellTargetId] = useState<string | null>(null);
  /** Item whose folder action has committed (full affordance). */
  const [folderTargetId, setFolderTargetId] = useState<string | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dwellTargetRef = useRef<string | null>(null);
  const folderTargetRef = useRef<string | null>(null);
  /** Item rects captured at drag start; dwell hit-testing stays anchored
   * to these stable boxes while sortable items shuffle around. */
  const frozenRectsRef = useRef<Map<string, FrozenRect> | null>(null);

  // ----- Selection (ctrl/shift-click) ------------------------------------

  /** Ids of selected scripts; folders are never selectable. */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  /** When a selected item starts dragging with more selected, these move
   * together; null means a plain single-item drag. */
  const [multiDragIds, setMultiDragIds] = useState<string[] | null>(null);
  /** Pointer delta during a multi-drag, applied to the selected siblings
   * so the whole stack travels with the cursor. */
  const [dragDelta, setDragDelta] = useState<{ x: number; y: number } | null>(
    null
  );

  const clearSelection = useCallback(() => {
    setSelectedIds((prev) => (prev.length > 0 ? [] : prev));
  }, []);

  useEffect(() => {
    providers.onOutput(() => setOutput(providers.outputMap));

    zebar.currentWidget().tauriWindow.listen('tauri://blur', () => {
      // Native file dialogs (e.g. the icon picker's upload dialog) steal
      // OS focus and fire blur; don't dismiss the launcher for those.
      if (isFileDialogActive()) return;
      zebar.currentWidget().close();
    });
  }, []);

  // Escape walks back out: selection first, then search, then the open
  // folder, then it closes the widget the same way a blur does.
  // Menus/modals handle their own Escape and stop it from reaching here,
  // so they close first.
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (selectedIds.length > 0) {
        clearSelection();
        return;
      }

      if (query) {
        setQuery('');
        return;
      }

      if (currentFolderId) {
        setCurrentFolderId(null);
        return;
      }

      zebar.currentWidget().close();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [query, currentFolderId, selectedIds, clearSelection]);

  // Items can disappear behind the launcher's back (deleted from the
  // settings window); keep the selection free of stale ids.
  useEffect(() => {
    setSelectedIds((prev) => {
      const next = prev.filter((id) =>
        applications.some((item) => item.id === id && !isLauncherFolder(item))
      );
      return next.length === prev.length ? prev : next;
    });
  }, [applications]);

  // A folder can disappear while open in the launcher (e.g. deleted from
  // the settings window); fall back to the top level instead of stranding
  // the view on a missing folder.
  useEffect(() => {
    if (
      currentFolderId &&
      !applications.some(
        (item) => isLauncherFolder(item) && item.id === currentFolderId
      )
    ) {
      setCurrentFolderId(null);
    }
  }, [applications, currentFolderId]);

  useEffect(() => {
    return () => {
      if (hoverTimeout.current !== null) clearTimeout(hoverTimeout.current);
    };
  }, []);

  const handleOnSettingsClick = () => {
    zebar.startWidgetPreset('config-widget', 'default');
  };

  const handleAddOrUpdate = () => {
    if (editingId) {
      setApplications(
        applications.map((item) =>
          item.id === editingId && !isLauncherFolder(item) ? newApp : item
        )
      );
    } else {
      // Scripts added while a folder is open land inside it.
      const parentId =
        !isSearching && currentFolderId ? currentFolderId : undefined;
      setApplications([
        ...applications,
        { ...newApp, id: generateId(), parentId },
      ]);
    }
    setNewApp({ id: '', title: '', command: '', args: [] });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleOpenModalForAdd = () => {
    setEditingId(null);
    setNewApp({ id: '', title: '', command: '', args: [] });
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (appToEdit: LauncherCommand) => {
    setEditingId(appToEdit.id);
    setNewApp(appToEdit);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setApplications(applications.filter((item) => item.id !== id));
  };

  const handleDeleteSelected = (ids: string[]) => {
    const idSet = new Set(ids);
    setApplications(applications.filter((item) => !idSet.has(item.id)));
    clearSelection();
  };

  const handleOpenFolder = (folder: LauncherFolder) => {
    clearSelection();
    setQuery('');
    setCurrentFolderId(folder.id);
  };

  const handleOpenFolderModalForAdd = () => {
    setEditingFolderId(null);
    setFolderName('');
    setIsFolderModalOpen(true);
  };

  const handleOpenFolderModalForRename = (folder: LauncherFolder) => {
    setEditingFolderId(folder.id);
    setFolderName(folder.title);
    setIsFolderModalOpen(true);
  };

  const handleAddOrUpdateFolder = () => {
    const title = folderName.trim();
    if (!title) return;

    if (editingFolderId) {
      setApplications(
        applications.map((item) =>
          isLauncherFolder(item) && item.id === editingFolderId
            ? { ...item, title }
            : item
        )
      );
    } else {
      setApplications([
        ...applications,
        { id: generateId(), type: 'folder', title },
      ]);
    }
    setFolderName('');
    setEditingFolderId(null);
    setIsFolderModalOpen(false);
  };

  // Deleting a folder keeps its scripts: they lift up to the top level,
  // taking the folder's slot in order.
  const handleDeleteFolder = (folder: LauncherFolder) => {
    const next = applications.filter((item) => item.id !== folder.id);
    const folderIndex = applications.findIndex((item) => item.id === folder.id);
    if (folderIndex === -1) return;

    const children = applications
      .filter((item) => !isLauncherFolder(item) && item.parentId === folder.id)
      .map((child) => ({ ...child, parentId: undefined }));
    next.splice(folderIndex, 0, ...children);
    setApplications(next);

    if (currentFolderId === folder.id) setCurrentFolderId(null);
  };

  const handleMoveToTopLevel = (id: string) => {
    handleMoveSelectedOut([id]);
  };

  const handleMoveSelectedOut = (ids: string[]) => {
    const idSet = new Set(ids);
    setApplications(
      applications.map((item) =>
        !isLauncherFolder(item) && idSet.has(item.id)
          ? { ...item, parentId: undefined }
          : item
      )
    );
    clearSelection();
  };

  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;

  const currentFolder = useMemo(
    () =>
      currentFolderId
        ? applications.find(
            (item): item is LauncherFolder =>
              isLauncherFolder(item) && item.id === currentFolderId
          )
        : undefined,
    [applications, currentFolderId]
  );

  const folderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of applications) {
      if (!isLauncherFolder(item) && item.parentId) {
        counts.set(item.parentId, (counts.get(item.parentId) ?? 0) + 1);
      }
    }
    return counts;
  }, [applications]);

  // Search looks through every folder; otherwise the view shows the items
  // of the current folder (or the top level), in their persisted order.
  const visibleItems = useMemo(() => {
    if (isSearching) {
      return applications.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (!isLauncherFolder(item) && item.command.toLowerCase().includes(q))
      );
    }
    return applications.filter(
      (item) => (item.parentId ?? null) === currentFolderId
    );
  }, [applications, q, isSearching, currentFolderId]);

  // Ctrl+A selects every visible script (never folders) for bulk moves;
  // skipped while typing so the search field keeps native text selection.
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'a')
        return;
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      ) {
        return;
      }
      const ids = visibleItems
        .filter((item) => !isLauncherFolder(item))
        .map((item) => item.id);
      if (ids.length === 0) return;
      event.preventDefault();
      setSelectedIds(ids);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visibleItems]);

  const activeItem =
    activeId !== null
      ? (applications.find((item) => item.id === activeId) ?? null)
      : null;

  // ----- Selection interactions -----------------------------------------

  const handleItemClick = (item: LauncherItem, event: ReactMouseEvent) => {
    if (isLauncherFolder(item)) {
      if (!event.shiftKey && !(event.ctrlKey || event.metaKey))
        clearSelection();
      handleOpenFolder(item);
      return;
    }

    const index = visibleItems.findIndex((visible) => visible.id === item.id);
    if (index === -1) return;

    if (event.shiftKey) {
      // Shift extends the selection: everything between the topmost and
      // bottommost selected items (plus the clicked one) becomes
      // selected, without dropping what was already picked.
      let start = index;
      let end = index;
      visibleItems.forEach((visible, visibleIndex) => {
        if (!selectedIds.includes(visible.id)) return;
        start = Math.min(start, visibleIndex);
        end = Math.max(end, visibleIndex);
      });
      const range = visibleItems
        .slice(start, end + 1)
        .filter((visible) => !isLauncherFolder(visible))
        .map((visible) => visible.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...range])));
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      setSelectedIds((prev) =>
        prev.includes(item.id)
          ? prev.filter((id) => id !== item.id)
          : [...prev, item.id]
      );
      return;
    }

    // Plain click keeps the launcher's core interaction: launch (and
    // drop any selection that was in progress).
    clearSelection();
    launch(item, output.glazewm);
  };

  // ----- Drag & drop ----------------------------------------------------

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // Pointer-precise detection so "over" always reflects the item actually
  // under the cursor. While a folder action is engaged, collisions are
  // suppressed so shuffled items settle back and the target stays put.
  const collisionDetection = useCallback<CollisionDetection>((args) => {
    if (folderTargetRef.current !== null) return [];
    const pointerCollisions = pointerWithin(args);
    return pointerCollisions.length > 0
      ? pointerCollisions
      : rectIntersection(args);
  }, []);

  const handleDragStart = ({ active }: DragStartEvent) => {
    const activeItemId = String(active.id);
    setActiveId(activeItemId);
    const rect = active.rect.current.initial;
    setActiveRect(rect ? { width: rect.width, height: rect.height } : null);

    // Dragging an unselected item while others are selected starts a
    // fresh single-item drag, like in Explorer.
    const isSelected = selectedIds.includes(activeItemId);
    if (!isSelected && selectedIds.length > 0) clearSelection();
    setMultiDragIds(isSelected && selectedIds.length > 1 ? selectedIds : null);

    // Freeze item boxes as they are at pickup. dnd-kit's own "over" jumps
    // around as sortable items shift out of the way (endlessly in list
    // view), so dwell detection cannot rely on it.
    const rects = new Map<string, FrozenRect>();
    document
      .querySelectorAll<HTMLElement>('[data-launcher-id]')
      .forEach((element) => {
        const id = element.dataset.launcherId;
        if (!id) return;
        const box = element.getBoundingClientRect();
        rects.set(id, {
          left: box.left,
          top: box.top,
          right: box.right,
          bottom: box.bottom,
        });
      });
    frozenRectsRef.current = rects;
  };

  // During a multi-drag, track the pointer delta so the selected siblings
  // travel alongside the overlay.
  const handleDragMove = ({ delta }: DragMoveEvent) => {
    if (multiDragIds === null) return;
    setDragDelta({ x: delta.x, y: delta.y });
  };

  const setDwell = useCallback((targetId: string | null) => {
    if (hoverTimeout.current !== null) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    dwellTargetRef.current = targetId;
    setDwellTargetId(targetId);
    if (folderTargetRef.current !== null) {
      folderTargetRef.current = null;
      setFolderTargetId(null);
    }
    if (!targetId) return;

    hoverTimeout.current = setTimeout(() => {
      folderTargetRef.current = targetId;
      setFolderTargetId(targetId);
    }, FOLDER_HOVER_DELAY);
  }, []);

  const hitTestItem = useCallback(
    (x: number, y: number): string | null => {
      const rects = frozenRectsRef.current;
      if (!rects) return null;
      for (const [id, rect] of rects) {
        if (id === activeId) continue;
        if (
          x >= rect.left &&
          x <= rect.right &&
          y >= rect.top &&
          y <= rect.bottom
        ) {
          return id;
        }
      }
      return null;
    },
    [activeId]
  );

  // Spring-loading state machine: the item under the pointer (per the
  // frozen boxes) highlights instantly; holding still for the dwell
  // commits the folder action, moving away disengages it.
  const runDwell = useCallback(
    (x: number, y: number) => {
      if (isSearching || currentFolderId !== null) {
        if (dwellTargetRef.current !== null) setDwell(null);
        return;
      }
      const draggedItem = applications.find((item) => item.id === activeId);
      if (!draggedItem || isLauncherFolder(draggedItem)) {
        if (dwellTargetRef.current !== null) setDwell(null);
        return;
      }
      const target = hitTestItem(x, y);
      if (target === dwellTargetRef.current) return;
      setDwell(target);
    },
    [
      activeId,
      applications,
      currentFolderId,
      hitTestItem,
      isSearching,
      setDwell,
    ]
  );

  useEffect(() => {
    if (activeId === null) return;

    const handlePointerMove = (event: PointerEvent) => {
      runDwell(event.clientX, event.clientY);
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [activeId, runDwell]);

  const resetDragState = () => {
    setDwell(null);
    frozenRectsRef.current = null;
    setActiveId(null);
    setActiveRect(null);
    setMultiDragIds(null);
    setDragDelta(null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const activeItemId = String(active.id);
    const overId = over?.id != null ? String(over.id) : null;
    const engagedTargetId = folderTargetRef.current;

    resetDragState();

    const dragIds =
      multiDragIds !== null && multiDragIds.includes(activeItemId)
        ? multiDragIds
        : [activeItemId];

    // Dropped on the folder header: move the scripts out to the top level.
    if (overId === ROOT_DROP_ID) {
      if (currentFolderId) handleMoveSelectedOut(dragIds);
      return;
    }

    if (engagedTargetId && engagedTargetId !== activeItemId) {
      // Spring-loaded folder action: tuck the dragged scripts into a
      // folder, or group them with the target script in a new one.
      handleFolderDrop(dragIds, engagedTargetId);
      return;
    }

    if (!overId || overId === activeItemId || isSearching) return;
    if (dragIds.length > 1) reorderVisibleBlock(dragIds, overId);
    else reorderVisible(activeItemId, overId);
  };

  const handleDragCancel = () => {
    resetDragState();
  };

  // Rewrites the flat array so the items of the current level follow the
  // new on-screen order, leaving items of other levels untouched.
  const reorderVisible = (activeItemId: string, overItemId: string) => {
    const oldIndex = visibleItems.findIndex((item) => item.id === activeItemId);
    const newIndex = visibleItems.findIndex((item) => item.id === overItemId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const ordered = arrayMove(visibleItems, oldIndex, newIndex);
    let cursor = 0;
    const level = currentFolderId;
    setApplications(
      applications.map((item) =>
        (item.parentId ?? null) === level ? (ordered[cursor++] ?? item) : item
      )
    );
  };

  // Same, but relocates a whole selection as a contiguous block: the
  // selected items keep their relative order and land at the target's
  // position.
  const reorderVisibleBlock = (dragIds: string[], overItemId: string) => {
    const idSet = new Set(dragIds);
    const moving = visibleItems.filter((item) => idSet.has(item.id));
    if (moving.length === 0) return;
    const others = visibleItems.filter((item) => !idSet.has(item.id));
    const insertIndex = others.findIndex((item) => item.id === overItemId);
    if (insertIndex === -1) return;

    const ordered = [
      ...others.slice(0, insertIndex),
      ...moving,
      ...others.slice(insertIndex),
    ];
    let cursor = 0;
    const level = currentFolderId;
    setApplications(
      applications.map((item) =>
        (item.parentId ?? null) === level ? (ordered[cursor++] ?? item) : item
      )
    );
  };

  // Spring-loaded folder action for one or more dragged scripts: dropping
  // on a folder tucks them all inside; dropping on a script wraps the
  // whole group with the target in a fresh folder at the target's spot.
  const handleFolderDrop = (dragIds: string[], targetItemId: string) => {
    if (currentFolderId || isSearching) return;
    const targetItem = applications.find((item) => item.id === targetItemId);
    if (!targetItem) return;

    const idSet = new Set(dragIds);
    const draggedItems = applications.filter(
      (item) =>
        idSet.has(item.id) &&
        !isLauncherFolder(item) &&
        item.id !== targetItem.id
    );
    if (draggedItems.length === 0) return;

    if (isLauncherFolder(targetItem)) {
      const next = applications.filter((item) => !idSet.has(item.id));
      const targetIndex = next.findIndex((item) => item.id === targetItem.id);
      next.splice(
        targetIndex + 1,
        0,
        ...draggedItems.map((item) => ({ ...item, parentId: targetItem.id }))
      );
      setApplications(next);
      clearSelection();
      return;
    }

    const folder: LauncherFolder = {
      id: generateId(),
      type: 'folder',
      title: 'New folder',
    };
    const memberIds = new Set([
      targetItem.id,
      ...draggedItems.map((item) => item.id),
    ]);
    let placed = false;
    const next = applications.flatMap((item) => {
      if (!memberIds.has(item.id)) return [item];
      if (placed) return [];
      placed = true;
      return [
        folder,
        { ...targetItem, parentId: folder.id },
        ...draggedItems.map((child) => ({ ...child, parentId: folder.id })),
      ];
    });
    setApplications(next);
    setEditingFolderId(folder.id);
    setFolderName(folder.title);
    setIsFolderModalOpen(true);
    clearSelection();
  };

  // ----- Focus navigation ----------------------------------------------

  const moveFocus = useCallback((event: KeyboardEvent, columns: number) => {
    const items = Array.from(
      (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
        ITEM_SELECTOR
      )
    );
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (index === -1) return;

    let next = -1;
    switch (event.key) {
      case 'ArrowRight':
        next = index + 1;
        break;
      case 'ArrowLeft':
        next = index - 1;
        break;
      case 'ArrowDown':
        next = index + columns;
        break;
      case 'ArrowUp':
        next = index - columns;
        break;
      default:
        return;
    }
    if (next < 0 || next >= items.length) return;

    event.preventDefault();
    items[next]?.focus();
  }, []);

  // Column count is derived from the rendered grid so arrow keys match the
  // actual layout at any widget width.
  const handleGridKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!event.key.startsWith('Arrow')) return;
      const columns = getComputedStyle(
        event.currentTarget as HTMLElement
      ).gridTemplateColumns.split(' ').length;
      moveFocus(event, columns);
    },
    [moveFocus]
  );

  const handleListKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        moveFocus(event, 1);
      }
    },
    [moveFocus]
  );

  const handlers: ItemHandlers = {
    onOpenFolder: handleOpenFolder,
    onEditScript: handleOpenModalForEdit,
    onDelete: handleDelete,
    onRenameFolder: handleOpenFolderModalForRename,
    onDeleteFolder: handleDeleteFolder,
    onMoveToTopLevel: handleMoveToTopLevel,
    onItemClick: handleItemClick,
    onDeleteSelected: handleDeleteSelected,
    onMoveSelectedOut: handleMoveSelectedOut,
    onClearSelection: clearSelection,
  };

  // Selected items other than the one being dragged follow the pointer
  // during a multi-drag.
  const isGhostMover = (itemId: string) =>
    multiDragIds !== null &&
    multiDragIds.includes(itemId) &&
    activeId !== itemId;

  const emptyState = (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
      <Search className="text-text-muted size-8" strokeWidth={1.5} />
      <h1 className="text-wrap-balance">Scripts you add will show up here</h1>
      <p className="text-text-muted max-w-xs text-pretty">
        These can be .exe paths, AHK scripts you commonly use, or generally just
        any shell command.
      </p>
    </div>
  );

  const noResults = (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
      <h1 className="text-wrap-balance">No scripts match “{query}”</h1>
      <p className="text-text-muted">Try a different name or command.</p>
    </div>
  );

  const folderEmptyState = (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
      <Folder className="text-text-muted size-8" strokeWidth={1.5} />
      <h1 className="text-wrap-balance">Nothing in this folder yet</h1>
      <p className="text-text-muted max-w-xs text-pretty">
        Add a script with the plus below, or drag one onto the folder.
      </p>
    </div>
  );

  return (
    <div className="text-text relative h-screen select-none overflow-hidden rounded-lg border border-button-border/80 bg-background shadow-sm backdrop-blur-xl antialiased">
      <UpdateScriptModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        newApp={newApp}
        setNewApp={setNewApp}
        editingId={editingId}
        onAddOrUpdate={handleAddOrUpdate}
      />
      <UpdateFolderModal
        open={isFolderModalOpen}
        setOpen={setIsFolderModalOpen}
        name={folderName}
        setName={setFolderName}
        editing={editingFolderId !== null}
        onSubmit={handleAddOrUpdateFolder}
      />
      <div className="flex h-full w-full flex-col">
        {applications.length > 0 && (
          <>
            {currentFolder && !isSearching && (
              <FolderHeader
                title={currentFolder.title}
                onBack={() => {
                  clearSelection();
                  setCurrentFolderId(null);
                }}
              />
            )}
            <div className="bg-surface flex shrink-0 items-center p-2 pb-0.5">
              <InputGroup>
                <InputGroupInput
                  className="px-2"
                  placeholder="Search scripts..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && visibleItems.length > 0) {
                      const first = visibleItems[0];
                      if (!first) return;
                      if (isLauncherFolder(first)) {
                        handleOpenFolder(first);
                      } else {
                        clearSelection();
                        launch(first, output.glazewm);
                      }
                    }
                  }}
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label="Clear search"
                      title="Clear (Esc)"
                      onClick={() => setQuery('')}
                    >
                      <X />
                    </InputGroupButton>
                  </InputGroupAddon>
                )}
              </InputGroup>
            </div>
          </>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="bg-surface min-h-0 min-w-0 flex-1 overflow-y-auto">
            {applications.length === 0 && emptyState}
            {applications.length > 0 &&
              visibleItems.length === 0 &&
              isSearching &&
              noResults}
            {applications.length > 0 &&
              visibleItems.length === 0 &&
              !isSearching &&
              currentFolder &&
              folderEmptyState}
            {visibleItems.length > 0 && view !== 'list' && (
              <SortableContext
                items={visibleItems.map((item) => item.id)}
                strategy={rectSortingStrategy}
              >
                <div
                  className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] content-start gap-1 p-2"
                  onKeyDown={handleGridKeyDown}
                >
                  {visibleItems.map((item) => (
                    <LauncherTile
                      key={item.id}
                      item={item}
                      dragEnabled={!isSearching}
                      isDwellTarget={dwellTargetId === item.id}
                      isFolderTarget={folderTargetId === item.id}
                      isSelected={selectedIds.includes(item.id)}
                      isGhostMover={isGhostMover(item.id)}
                      dragDelta={dragDelta}
                      selectedIds={selectedIds}
                      handlers={handlers}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
            {visibleItems.length > 0 && view === 'list' && (
              <SortableContext
                items={visibleItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className="flex flex-col gap-0.5 p-2"
                  onKeyDown={handleListKeyDown}
                >
                  {visibleItems.map((item) => (
                    <LauncherRow
                      key={item.id}
                      item={item}
                      folderCount={
                        isLauncherFolder(item)
                          ? folderCounts.get(item.id)
                          : undefined
                      }
                      showCommand={showCommands}
                      collapsePath={collapsePaths}
                      dragEnabled={!isSearching}
                      isDwellTarget={dwellTargetId === item.id}
                      isFolderTarget={folderTargetId === item.id}
                      isSelected={selectedIds.includes(item.id)}
                      isGhostMover={isGhostMover(item.id)}
                      dragDelta={dragDelta}
                      selectedIds={selectedIds}
                      handlers={handlers}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </div>

          <DragOverlay>
            {activeItem ? (
              <div className="relative">
                {multiDragIds !== null && multiDragIds.length > 1 && (
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
                {view === 'list' ? (
                  <RowPreview
                    item={activeItem}
                    width={activeRect?.width}
                    showCommand={
                      showCommands === true && !isLauncherFolder(activeItem)
                    }
                    collapsePath={collapsePaths === true}
                  />
                ) : (
                  <TilePreview item={activeItem} width={activeRect?.width} />
                )}
                {multiDragIds !== null && multiDragIds.length > 1 && (
                  <span className="bg-primary pointer-events-none absolute -top-2 -right-2 z-10 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none text-white shadow-md">
                    {multiDragIds.length}
                  </span>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <div
          className="bg-background text-text flex shrink-0 items-center justify-end gap-2 rounded-md rounded-t-none border-t border-border/60 p-2"
          style={{
            boxShadow:
              'inset 0 4px 10px -6px rgba(0,0,0,0.07), inset 0 14px 28px -14px rgba(0,0,0,0.16)',
          }}
        >
          {selectedIds.length > 0 && (
            <div className="mr-auto flex min-w-0 items-center gap-1">
              <span className="text-text-muted pl-1 text-xs leading-none whitespace-nowrap">
                {selectedIds.length} selected
              </span>
              {currentFolderId && !isSearching && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Move to top level"
                  aria-label="Move selected to top level"
                  className={interactive}
                  onClick={() => handleMoveSelectedOut(selectedIds)}
                >
                  <FolderOutput />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                title="Delete selected"
                aria-label="Delete selected"
                className={`${interactive} hover:text-danger`}
                onClick={() => handleDeleteSelected(selectedIds)}
              >
                <Trash2 />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                title="Clear selection (Esc)"
                aria-label="Clear selection"
                className="text-text-muted hover:text-text"
                onClick={clearSelection}
              >
                <X />
              </Button>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(triggerProps: ComponentProps<typeof Button>) => (
                <Button
                  {...triggerProps}
                  size="icon"
                  title="Add"
                  aria-label="Add"
                  className={interactive}
                >
                  <Plus className="h-5 w-5" strokeWidth={2.5} />
                </Button>
              )}
            />
            <DropdownMenuContent side="top" align="end" sideOffset={6}>
              <DropdownMenuItem onClick={handleOpenModalForAdd}>
                <FilePlus2 />
                Add script
              </DropdownMenuItem>
              {!currentFolderId && (
                <DropdownMenuItem onClick={handleOpenFolderModalForAdd}>
                  <FolderPlus />
                  Add folder
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={handleOnSettingsClick}
            size="icon"
            title="Settings"
            className={interactive}
          >
            <Settings className="h-5 w-5" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function FolderHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: ROOT_DROP_ID });

  return (
    <div
      ref={setNodeRef}
      className={`bg-surface flex shrink-0 items-center gap-1.5 rounded-md px-2 pt-2 pb-1.5 transition-colors duration-150 ${
        isOver ? 'bg-primary/15' : ''
      }`}
    >
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onBack}
        title="Back to all scripts"
        aria-label="Back to all scripts"
        className="text-text-muted hover:text-text"
      >
        <ChevronLeft className="size-4" strokeWidth={2.5} />
      </Button>
      <FolderSquare className="size-5" glyphClassName="size-3.5" />
      <span className="text-text-muted min-w-0 flex-1 truncate text-xs font-medium leading-none">
        {title}
      </span>
      {isOver && (
        <span className="text-text-muted shrink-0 text-[10px] leading-none">
          Release to move out
        </span>
      )}
    </div>
  );
}

function FolderTargetBadge() {
  return (
    <span className="bg-primary pointer-events-none absolute -top-1.5 -right-1.5 z-10 flex size-4 items-center justify-center rounded-full text-white shadow-md">
      <FolderPlus className="size-2.5" strokeWidth={2.5} />
    </span>
  );
}

function SelectedBadge() {
  return (
    <span className="bg-primary pointer-events-none absolute -top-1.5 -right-1.5 z-10 flex size-4 items-center justify-center rounded-full text-white shadow-md">
      <Check className="size-2.5" strokeWidth={3.5} />
    </span>
  );
}

function LauncherTile({
  item,
  dragEnabled,
  isDwellTarget,
  isFolderTarget,
  isSelected,
  isGhostMover,
  dragDelta,
  selectedIds,
  handlers,
}: {
  item: LauncherItem;
  dragEnabled: boolean;
  isDwellTarget: boolean;
  isFolderTarget: boolean;
  isSelected: boolean;
  isGhostMover: boolean;
  dragDelta: { x: number; y: number } | null;
  selectedIds: string[];
  handlers: ItemHandlers;
}) {
  const isFolder = isLauncherFolder(item);
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !dragEnabled });
  const dragProps = dragEnabled ? { ...attributes, ...listeners } : {};

  return (
    <ContextMenu
      onOpenChange={(open) => {
        setMenuOpen(open);
        // Right-clicking past the selection starts a fresh single-item
        // context, like in Explorer.
        if (open && selectedIds.length > 0 && !selectedIds.includes(item.id))
          handlers.onClearSelection();
      }}
    >
      <div
        ref={setNodeRef}
        data-launcher-id={item.id}
        style={{
          transform:
            isGhostMover && dragDelta
              ? `translate3d(${dragDelta.x}px, ${dragDelta.y}px, 0)`
              : CSS.Translate.toString(transform),
          transition: isGhostMover ? 'none' : transition,
        }}
        className={`relative ${isDragging ? 'opacity-30' : ''} ${
          isGhostMover ? 'z-20' : ''
        }`}
      >
        {isFolderTarget ? (
          <FolderTargetBadge />
        ) : isSelected ? (
          <SelectedBadge />
        ) : null}
        <ContextMenuTrigger
          render={(triggerProps: ComponentProps<'button'>) => (
            <button
              {...triggerProps}
              {...dragProps}
              type="button"
              data-launcher-item
              aria-pressed={isSelected}
              onClick={(event) => handlers.onItemClick(item, event)}
              className={`${interactive} text-text-muted hover:text-text active:scale-[0.96] flex h-[4.75rem] w-full min-w-0 flex-col items-center justify-center gap-2 rounded-md p-1.5 hover:bg-button/60 ${
                menuOpen ? 'bg-button/60 text-text' : ''
              } ${
                isFolderTarget
                  ? 'bg-primary/15 text-text ring-primary/60 scale-105 ring-[3px]'
                  : isDwellTarget
                    ? 'bg-primary/10 ring-primary/40 ring-2'
                    : isSelected
                      ? 'bg-primary/10 text-text ring-primary/50 ring-2'
                      : ''
              }`}
            >
              {isFolder ? (
                <FolderSquare className="size-9" glyphClassName="size-6" />
              ) : (
                <IconSquare
                  app={item}
                  className="size-9"
                  glyphClassName="size-7"
                />
              )}
              <span className="w-full truncate text-center text-xs">
                {item.title}
              </span>
            </button>
          )}
        />
      </div>
      <LauncherContextMenu
        item={item}
        selectedIds={selectedIds}
        handlers={handlers}
      />
    </ContextMenu>
  );
}

function LauncherRow({
  item,
  folderCount,
  showCommand,
  collapsePath,
  dragEnabled,
  isDwellTarget,
  isFolderTarget,
  isSelected,
  isGhostMover,
  dragDelta,
  selectedIds,
  handlers,
}: {
  item: LauncherItem;
  folderCount?: number;
  showCommand?: boolean;
  collapsePath?: boolean;
  dragEnabled: boolean;
  isDwellTarget: boolean;
  isFolderTarget: boolean;
  isSelected: boolean;
  isGhostMover: boolean;
  dragDelta: { x: number; y: number } | null;
  selectedIds: string[];
  handlers: ItemHandlers;
}) {
  const isFolder = isLauncherFolder(item);
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !dragEnabled });
  const dragProps = dragEnabled ? { ...attributes, ...listeners } : {};
  const command =
    !isFolder && collapsePath
      ? collapseCommandPath(item.command)
      : isFolder
        ? undefined
        : item.command;

  return (
    <ContextMenu
      onOpenChange={(open) => {
        setMenuOpen(open);
        // Right-clicking past the selection starts a fresh single-item
        // context, like in Explorer.
        if (open && selectedIds.length > 0 && !selectedIds.includes(item.id))
          handlers.onClearSelection();
      }}
    >
      <div
        ref={setNodeRef}
        data-launcher-id={item.id}
        style={{
          transform:
            isGhostMover && dragDelta
              ? `translate3d(${dragDelta.x}px, ${dragDelta.y}px, 0)`
              : CSS.Translate.toString(transform),
          transition: isGhostMover ? 'none' : transition,
        }}
        className={`relative ${isDragging ? 'opacity-30' : ''} ${
          isGhostMover ? 'z-20' : ''
        }`}
      >
        {isFolderTarget ? (
          <FolderTargetBadge />
        ) : isSelected ? (
          <SelectedBadge />
        ) : null}
        <ContextMenuTrigger
          render={(triggerProps: ComponentProps<'button'>) => (
            <button
              {...triggerProps}
              {...dragProps}
              type="button"
              data-launcher-item
              aria-pressed={isSelected}
              onClick={(event) => handlers.onItemClick(item, event)}
              className={`${interactive} text-text hover:bg-button/60 active:bg-button flex w-full min-w-0 items-center gap-2.5 rounded-md py-1.5 pl-[9px] pr-2 text-left ${
                menuOpen ? 'bg-button/60' : ''
              } ${
                isFolderTarget
                  ? 'bg-primary/15 ring-primary/60 ring-[3px]'
                  : isDwellTarget
                    ? 'bg-primary/10 ring-primary/40 ring-2'
                    : isSelected
                      ? 'bg-primary/10 ring-primary/50 ring-2'
                      : ''
              }`}
            >
              {isFolder ? (
                <FolderSquare className="size-6" glyphClassName="size-4" />
              ) : (
                <IconSquare
                  app={item}
                  className="size-6"
                  glyphClassName="size-4"
                />
              )}
              <span className="min-w-0 flex-1 truncate text-sm leading-none">
                {item.title}
              </span>
              {isFolder
                ? showCommand &&
                  folderCount !== undefined && (
                    <span className="text-text-muted shrink-0 translate-y-[1px] text-xs leading-none">
                      {folderCount} {folderCount === 1 ? 'script' : 'scripts'}
                    </span>
                  )
                : showCommand && (
                    <span className="text-text-muted min-w-0 max-w-[45%] truncate text-xs leading-none translate-y-[1px]">
                      {command}
                    </span>
                  )}
            </button>
          )}
        />
      </div>
      <LauncherContextMenu
        item={item}
        selectedIds={selectedIds}
        handlers={handlers}
      />
    </ContextMenu>
  );
}

function LauncherContextMenu({
  item,
  selectedIds,
  handlers,
}: {
  item: LauncherItem;
  selectedIds: string[];
  handlers: ItemHandlers;
}) {
  // Right-clicking a selected script with more selected acts on the
  // whole selection instead of just the item under the cursor.
  const isBulk =
    !isLauncherFolder(item) &&
    selectedIds.length > 1 &&
    selectedIds.includes(item.id);

  if (isBulk) {
    return (
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuLabel className="max-w-56 truncate">
            {selectedIds.length} selected
          </ContextMenuLabel>
          {item.parentId && (
            <ContextMenuItem
              onClick={() => handlers.onMoveSelectedOut(selectedIds)}
            >
              Move to top level
            </ContextMenuItem>
          )}
          <ContextMenuItem
            onClick={() => handlers.onDeleteSelected(selectedIds)}
          >
            Delete {selectedIds.length} items
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    );
  }

  return (
    <ContextMenuContent>
      <ContextMenuGroup>
        <ContextMenuLabel className="max-w-56 truncate">
          {item.title}
        </ContextMenuLabel>
        {isLauncherFolder(item) ? (
          <>
            <ContextMenuItem onClick={() => handlers.onOpenFolder(item)}>
              Open
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handlers.onRenameFolder(item)}>
              Rename
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handlers.onDeleteFolder(item)}>
              Delete
            </ContextMenuItem>
          </>
        ) : (
          <>
            <ContextMenuItem onClick={() => handlers.onEditScript(item)}>
              Edit
            </ContextMenuItem>
            {item.parentId && (
              <ContextMenuItem
                onClick={() => handlers.onMoveToTopLevel(item.id)}
              >
                Move to top level
              </ContextMenuItem>
            )}
            <ContextMenuItem onClick={() => handlers.onDelete(item.id)}>
              Delete
            </ContextMenuItem>
          </>
        )}
      </ContextMenuGroup>
    </ContextMenuContent>
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

function collapseCommandPath(command: string): string {
  const trimmed = command.trim();
  const segments = trimmed.split(/[\\/]+/);
  const last = segments[segments.length - 1];
  return last === undefined || last === '' ? trimmed : last;
}

async function launch(
  application: LauncherCommand,
  glazewm: zebar.GlazeWmOutput | null
) {
  if (!glazewm) return;
  logger.log('Launching command', application.command, application.args);
  await glazewm.runCommand(
    `shell-exec ${application.command} ${application.args.join(' ')}`
  );
}

export default App;
