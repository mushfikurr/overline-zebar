import {
  isLauncherFolder,
  moveBlockToLevel,
  reorderBlockWithinLevel,
  reorderWithinLevel,
  type LauncherCommand,
  type LauncherItem,
} from '@overline-zebar/config';
import {
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { LauncherApplicationsModel } from '../model/useLauncherApplications';

/**
 * How long a script must dwell on another item before the folder action
 * commits (join an existing folder / create a new one). Matches Apple's
 * spring-loading guidance: highlight instantly, commit after roughly half
 * a second — long enough to not fire mid-pass, short enough to feel
 * responsive.
 */
export const FOLDER_HOVER_DELAY = 600;

/** Droppable id of a surface-level drop zone (the settings list
 * heading); dropping on it moves scripts out to the top level. */
export const ROOT_DROP_ID = 'launcher-root-drop';

/** Droppable id of the launcher's folder-view header; dropping on it
 * lifts scripts up one level — out of the open folder into its parent,
 * which is the top level for top-level folders. */
export const PARENT_DROP_ID = 'launcher-parent-drop';

type FrozenRect = { left: number; top: number; right: number; bottom: number };

/** Selection controller of the hosting surface; multi-item drags follow
 * it. Surfaces without selection omit it. */
export type LauncherDndSelection = {
  selectedIds: string[];
  clearSelection: () => void;
};

/**
 * Grouping two scripts into a new folder only applies at the top level;
 * folder children reorder or move onto folders instead.
 */
function canReceiveSpringLoad(
  dragged: LauncherCommand,
  target: LauncherItem
): boolean {
  if (isLauncherFolder(target)) return true;
  return (
    (dragged.parentId ?? null) === null && (target.parentId ?? null) === null
  );
}

/**
 * The launcher drag & drop behavior shared by the launcher widget and the
 * settings applications tab: reorder with dnd-kit, spring-loaded folder
 * actions (dwell on an item to tuck into a folder or group into a new
 * one), lift-out drop zones, and multi-drag of a selection.
 *
 * The hook is view-agnostic: it hit-tests items via their
 * `[data-launcher-id]` attribute and talks to the data through the model
 * hook, so any layout can host it.
 */
export function useLauncherDnd({
  model,
  selection,
  springLoadEnabled = true,
}: {
  model: LauncherApplicationsModel;
  selection?: LauncherDndSelection;
  /** Whether spring-loaded folder actions are active. The launcher
   * disables them while searching and inside a folder. */
  springLoadEnabled?: boolean;
}) {
  const { applications, setApplications, stageGrouping } = model;
  const selectedIds = selection?.selectedIds ?? [];
  const clearSelection = selection?.clearSelection ?? (() => {});

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

  /** When a selected item starts dragging with more selected, these move
   * together; null means a plain single-item drag. */
  const [multiDragIds, setMultiDragIds] = useState<string[] | null>(null);
  /** Pointer delta during a multi-drag, applied to the selected siblings
   * so the whole stack travels with the cursor. */
  const [dragDelta, setDragDelta] = useState<{ x: number; y: number } | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (hoverTimeout.current !== null) clearTimeout(hoverTimeout.current);
    };
  }, []);

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
      if (!springLoadEnabled) {
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
      const targetItem =
        target !== null
          ? (applications.find((item) => item.id === target) ?? null)
          : null;
      // Only highlight targets that can actually receive the folder
      // action, so the ring always implies the drop.
      if (targetItem && !canReceiveSpringLoad(draggedItem, targetItem)) {
        setDwell(null);
        return;
      }
      setDwell(target);
    },
    [activeId, applications, hitTestItem, setDwell, springLoadEnabled]
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

  // Spring-loaded folder action for one or more dragged scripts: dropping
  // on a folder tucks them all inside; dropping on a script stages a new
  // folder wrapping the whole group, applied only once the dialog is
  // confirmed.
  const commitFolderDrop = (dragIds: string[], targetItemId: string) => {
    const targetItem = applications.find((item) => item.id === targetItemId);
    if (!targetItem) return;

    if (isLauncherFolder(targetItem)) {
      model.moveScriptsIntoFolder(dragIds, targetItem.id);
      clearSelection();
      return;
    }

    const idSet = new Set(dragIds);
    const dragged = applications.filter(
      (item) =>
        idSet.has(item.id) &&
        !isLauncherFolder(item) &&
        item.id !== targetItem.id
    );
    if (dragged.length === 0) return;

    stageGrouping([targetItem.id, ...dragged.map((item) => item.id)]);
    clearSelection();
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

    // Dropped on a root-level drop zone: move the scripts out to the top
    // level.
    if (overId === ROOT_DROP_ID) {
      model.moveScriptsToTopLevel(dragIds);
      clearSelection();
      return;
    }

    // Dropped on the folder-view header: lift the scripts up one level,
    // into the open folder's own parent — dynamic, so nested folders
    // would keep working unchanged.
    if (overId === PARENT_DROP_ID) {
      model.moveScriptsUpLevel(dragIds);
      clearSelection();
      return;
    }

    if (engagedTargetId && engagedTargetId !== activeItemId) {
      commitFolderDrop(dragIds, engagedTargetId);
      return;
    }

    if (!overId || overId === activeItemId) return;
    const draggedItem = applications.find((item) => item.id === activeItemId);
    if (!draggedItem) return;
    const overItem = applications.find((item) => item.id === overId);
    if (!overItem) return;
    const level = draggedItem.parentId ?? null;

    // Dropped on an item of another level: dragging a script out of its
    // folder lifts it into the target level at the drop position. The
    // destination comes off the hovered item, so any nesting depth needs
    // no changes here.
    if ((overItem.parentId ?? null) !== level) {
      const next = moveBlockToLevel(applications, dragIds, overId);
      if (next !== applications) {
        setApplications(next);
        clearSelection();
      }
      return;
    }

    if (dragIds.length > 1) {
      const next = reorderBlockWithinLevel(
        applications,
        dragIds,
        overId,
        level
      );
      if (next !== applications) setApplications(next);
    } else {
      const next = reorderWithinLevel(
        applications,
        activeItemId,
        overId,
        level
      );
      if (next !== applications) setApplications(next);
    }
  };

  const handleDragCancel = () => {
    resetDragState();
  };

  const activeItem =
    activeId !== null
      ? (applications.find((item) => item.id === activeId) ?? null)
      : null;

  // Selected items other than the one being dragged follow the pointer
  // during a multi-drag.
  const isGhostMover = (itemId: string) =>
    multiDragIds !== null &&
    multiDragIds.includes(itemId) &&
    activeId !== itemId;

  return {
    sensors,
    collisionDetection,
    onDragStart: handleDragStart,
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
    onDragCancel: handleDragCancel,
    activeId,
    activeItem,
    activeRect,
    dwellTargetId,
    folderTargetId,
    multiDragIds,
    dragDelta,
    isGhostMover,
  };
}
