import {
  isLauncherFolder,
  type LauncherCommand,
  type LauncherItem,
} from '@overline-zebar/config';
import {
  moveBlockToLevel,
  reorderBlockWithinLevel,
  reorderWithinLevel,
} from '../utils/transforms';
import {
  KeyboardSensor,
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
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { LauncherApplicationsModel } from './useLauncherApplications';

export const FOLDER_HOVER_DELAY = 600;

export const ROOT_DROP_ID = 'launcher-root-drop';

export const PARENT_DROP_ID = 'launcher-parent-drop';

type FrozenRect = { left: number; top: number; right: number; bottom: number };

export type LauncherDndSelection = {
  selectedIds: string[];
  clearSelection: () => void;
};

function canReceiveSpringLoad(
  dragged: LauncherCommand,
  target: LauncherItem
): boolean {
  if (isLauncherFolder(target)) return true;
  return (
    (dragged.parentId ?? null) === null && (target.parentId ?? null) === null
  );
}

export function useLauncherDnd({
  model,
  selection,
  springLoadEnabled = true,
}: {
  model: LauncherApplicationsModel;
  selection?: LauncherDndSelection;
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
  const [dwellTargetId, setDwellTargetId] = useState<string | null>(null);
  const [folderTargetId, setFolderTargetId] = useState<string | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dwellTargetRef = useRef<string | null>(null);
  const folderTargetRef = useRef<string | null>(null);
  const frozenRectsRef = useRef<Map<string, FrozenRect> | null>(null);

  const [multiDragIds, setMultiDragIds] = useState<string[] | null>(null);
  const [dragDelta, setDragDelta] = useState<{ x: number; y: number } | null>(
    null
  );
  const dragDeltaRafRef = useRef<number | null>(null);
  const latestDeltaRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    return () => {
      if (hoverTimeout.current !== null) clearTimeout(hoverTimeout.current);
      if (dragDeltaRafRef.current !== null)
        cancelAnimationFrame(dragDeltaRafRef.current);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: {
        start: ['Space'],
        end: ['Space', 'Enter', 'Tab'],
        cancel: ['Escape'],
      },
    })
  );

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

    const isSelected = selectedIds.includes(activeItemId);
    if (!isSelected && selectedIds.length > 0) clearSelection();
    setMultiDragIds(isSelected && selectedIds.length > 1 ? selectedIds : null);

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

  const handleDragMove = ({ delta }: DragMoveEvent) => {
    if (multiDragIds === null) return;
    latestDeltaRef.current = { x: delta.x, y: delta.y };
    if (dragDeltaRafRef.current !== null) return;
    dragDeltaRafRef.current = requestAnimationFrame(() => {
      dragDeltaRafRef.current = null;
      setDragDelta(latestDeltaRef.current);
    });
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
    if (dragDeltaRafRef.current !== null) {
      cancelAnimationFrame(dragDeltaRafRef.current);
      dragDeltaRafRef.current = null;
    }
    latestDeltaRef.current = null;
    frozenRectsRef.current = null;
    setActiveId(null);
    setActiveRect(null);
    setMultiDragIds(null);
    setDragDelta(null);
  };

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

    if (overId === ROOT_DROP_ID) {
      model.moveScriptsToTopLevel(dragIds);
      clearSelection();
      return;
    }

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
