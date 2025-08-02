export function isObject(item: unknown): item is Record<string, unknown> {
  return item && typeof item === 'object' && !Array.isArray(item);
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
          const existingItemIndex = (mergedArray as { id: string }[]).findIndex(
            (targetItem) => targetItem.id === (sourceItem as { id: string }).id
          );
          if (existingItemIndex !== -1) {
            mergedArray[existingItemIndex] = deepMerge(
              mergedArray[existingItemIndex],
              sourceItem
            );
          } else {
            mergedArray.push(sourceItem);
          }
        });
        result[key as keyof T] = mergedArray as T[keyof T];
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        result[key as keyof T] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Partial<Record<string, unknown>>
        ) as T[keyof T];
      } else {
        result[key as keyof T] = sourceValue;
      }
    }
  }

  return result;
}
