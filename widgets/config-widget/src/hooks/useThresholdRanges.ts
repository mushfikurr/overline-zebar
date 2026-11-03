import { useEffect } from 'react';
import { LabelColor, Threshold, generateId } from '@overline-zebar/config';

export type ThresholdBounds = { min: number; max: number };
export type RangeEntry = { id: string; labelColor: LabelColor };

export const labelColorOptions: { value: LabelColor; label: string }[] = [
  { value: '--text', label: 'Text' },
  { value: '--warning', label: 'Warning' },
  { value: '--danger', label: 'Danger' },
];

const MAX_RANGES = 20;
const MIN_RANGE_WIDTH = 1;

/** Rewrites thresholds into contiguous ranges tiling `bounds`, keeping ids and colors. */
function normalizeThresholds(
  thresholds: Threshold[],
  bounds: ThresholdBounds
): Threshold[] {
  const sorted = [...thresholds]
    .sort((a, b) => a.min - b.min)
    .slice(0, MAX_RANGES);

  const stops = [bounds.min];
  let previousStop = bounds.min;
  for (const [i, threshold] of sorted.slice(0, -1).entries()) {
    const remaining = sorted.length - 1 - i;
    previousStop = Math.min(
      Math.max(threshold.max, previousStop + MIN_RANGE_WIDTH),
      bounds.max - remaining * MIN_RANGE_WIDTH
    );
    stops.push(previousStop);
  }
  stops.push(bounds.max);

  return sorted.map((threshold, i) => ({
    id: threshold.id,
    min: stops[i] ?? bounds.min,
    max: stops[i + 1] ?? bounds.max,
    labelColor: threshold.labelColor,
  }));
}

function thresholdsEqual(a: Threshold[], b: Threshold[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((t, i) => {
    const other = b[i];
    return (
      other !== undefined &&
      t.id === other.id &&
      t.min === other.min &&
      t.max === other.max &&
      t.labelColor === other.labelColor
    );
  });
}

/**
 * Maps stored thresholds onto contiguous `ranges` separated by shared
 * `stops`. Data that doesn't fit (legacy configs, unit switches) is
 * normalized and committed back so the editor shows what applies.
 */
export function useThresholdRanges(
  thresholds: Threshold[] | undefined,
  setThresholds: (thresholds: Threshold[]) => void,
  bounds: ThresholdBounds
) {
  const normalized = normalizeThresholds(thresholds ?? [], bounds);
  const ranges: RangeEntry[] = normalized.map(({ id, labelColor }) => ({
    id,
    labelColor,
  }));
  const stops = normalized.map((t) => t.min);
  if (stops.length === 0) {
    stops.push(bounds.min);
  }
  stops.push(bounds.max);
  const interiorStops = stops.slice(1, -1);

  useEffect(() => {
    if (!thresholdsEqual(normalized, thresholds ?? [])) {
      setThresholds(normalized);
    }
  }, [normalized, thresholds, setThresholds]);

  const commit = (nextRanges: RangeEntry[], nextStops: number[]) => {
    setThresholds(
      nextRanges.map((range, index) => ({
        id: range.id,
        min: nextStops[index] ?? bounds.min,
        max: nextStops[index + 1] ?? bounds.max,
        labelColor: range.labelColor,
      }))
    );
  };

  const rangeWidth = (index: number) =>
    (stops[index + 1] ?? bounds.max) - (stops[index] ?? bounds.min);

  const widestRangeIndex = () => {
    let index = 0;
    for (let i = 1; i < ranges.length; i++) {
      if (rangeWidth(i) > rangeWidth(index)) {
        index = i;
      }
    }
    return index;
  };

  const canAddRange =
    ranges.length === 0 ||
    (ranges.length < MAX_RANGES &&
      rangeWidth(widestRangeIndex()) >= MIN_RANGE_WIDTH * 2);

  const addRange = () => {
    if (!canAddRange) {
      return;
    }
    if (ranges.length === 0) {
      commit(
        [{ id: generateId(), labelColor: '--text' }],
        [bounds.min, bounds.max]
      );
      return;
    }
    const index = widestRangeIndex();
    const midpoint = Math.floor(
      ((stops[index] ?? bounds.min) + (stops[index + 1] ?? bounds.max)) / 2
    );
    const neighborColors = [
      ranges[index]?.labelColor,
      ranges[index + 1]?.labelColor,
    ];
    const labelColor =
      labelColorOptions
        .map((option) => option.value)
        .find((color) => !neighborColors.includes(color)) ?? '--text';
    commit(
      [...ranges.slice(0, index + 1), { id: generateId(), labelColor }],
      [...stops.slice(0, index + 1), midpoint, ...stops.slice(index + 1)]
    );
  };

  const deleteRange = (index: number) => {
    if (ranges.length <= 1) {
      return;
    }
    // Deleting a range merges it into its neighbor; the first range merges into the next.
    const stopToRemove = index > 0 ? index : 1;
    commit(
      ranges.filter((_, i) => i !== index),
      stops.filter((_, i) => i !== stopToRemove)
    );
  };

  const setStop = (stopIndex: number, newValue: number) => {
    const nextStops = [...stops];
    const lowerBound =
      (nextStops[stopIndex - 1] ?? bounds.min) + MIN_RANGE_WIDTH;
    const upperBound =
      (nextStops[stopIndex + 1] ?? bounds.max) - MIN_RANGE_WIDTH;
    nextStops[stopIndex] = Math.min(Math.max(newValue, lowerBound), upperBound);
    commit(ranges, nextStops);
  };

  const setInteriorStops = (value: readonly number[]) => {
    if (value.length !== interiorStops.length) {
      return;
    }
    commit(ranges, [bounds.min, ...value, bounds.max]);
  };

  const setColor = (index: number, newValue: LabelColor) => {
    commit(
      ranges.map((range, i) =>
        i === index ? { ...range, labelColor: newValue } : range
      ),
      stops
    );
  };

  return {
    ranges,
    stops,
    interiorStops,
    canAddRange,
    addRange,
    deleteRange,
    setStop,
    setInteriorStops,
    setColor,
  };
}
