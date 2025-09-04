import type { RefObject } from 'react';
import { currentWidget, WidgetPlacement } from 'zebar';

type Size = { width: number; height: number };

export const calculateWidgetPlacementFromRight = async (
  ref: RefObject<HTMLElement>,
  size: Size
) => {
  const windowSize = await currentWidget().tauriWindow.outerSize();
  const rect = ref.current?.getBoundingClientRect();
  const elementRight = (rect?.right ?? 0) + window.scrollX;
  const documentRight = document.documentElement.scrollWidth;

  const gap = documentRight - elementRight;

  return {
    anchor: 'top_right',
    offsetX: `-${gap - 0}px`,
    offsetY: `${windowSize.height + 6}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    monitorSelection: { type: 'primary' },
    dockToEdge: {
      enabled: false,
      edge: 'top',
      windowMargin: `${windowSize.height}px`,
    },
  } satisfies WidgetPlacement;
};

export const calculateWidgetPlacementFromLeft = async (
  ref: RefObject<HTMLElement>,
  size: Size,
  offsetX?: number
) => {
  const windowSize = await currentWidget().tauriWindow.outerSize();
  const rect = ref.current?.getBoundingClientRect();
  const elementLeft = (rect?.left ?? 0) + window.scrollX;

  return {
    anchor: 'top_left',
    offsetX: `${elementLeft - (offsetX ?? 0)}px`,
    offsetY: `${windowSize.height + 6}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    monitorSelection: { type: 'primary' },
    dockToEdge: {
      enabled: false,
      edge: 'top',
      windowMargin: `${windowSize.height}px`,
    },
  } satisfies WidgetPlacement;
};
