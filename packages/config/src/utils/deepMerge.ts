export function isObject(item: unknown): item is Record<string, unknown> {
  return !!(item && typeof item === 'object' && !Array.isArray(item));
}

function dedupeById<T extends { id: string }>(arr: T[]): T[] {
  const seen = new Map<string, T>();
  for (const item of arr) {
    if (item && typeof item.id === 'string') {
      seen.set(item.id, item);
    }
  }
  return Array.from(seen.values());
}

export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result: T = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key as keyof T];
      const targetValue = target[key as keyof T];

      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        const mergedArray = [...targetValue];
        (sourceValue as unknown[]).forEach((sourceItem) => {
          // Ensure items being compared have an 'id' property before trying to access it
          if (
            isObject(sourceItem) &&
            'id' in sourceItem &&
            typeof sourceItem.id === 'string'
          ) {
            const existingItemIndex = (mergedArray as unknown[]).findIndex(
              (targetItem) =>
                isObject(targetItem) &&
                'id' in targetItem &&
                targetItem.id === sourceItem.id
            );

            if (existingItemIndex !== -1) {
              const targetItem = mergedArray[existingItemIndex];
              // Both items must be objects to be merged
              if (isObject(targetItem) && isObject(sourceItem)) {
                mergedArray[existingItemIndex] = deepMerge(
                  targetItem,
                  sourceItem
                );
              } else {
                // Otherwise, just replace the item
                mergedArray[existingItemIndex] = sourceItem;
              }
            } else {
              mergedArray.push(sourceItem);
            }
          } else {
            // If the source item doesn't have an ID, just add it to the array.
            // This handles merging arrays of primitives or objects without IDs.
            mergedArray.push(sourceItem);
          }
        });
        result[key as keyof T] = mergedArray as T[keyof T];
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        result[key as keyof T] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Partial<Record<string, unknown>>
        ) as T[keyof T];
      } else if (sourceValue !== undefined) {
        // Do not overwrite with undefined values
        result[key as keyof T] = sourceValue;
      }
    }
  }

  return result;
}
