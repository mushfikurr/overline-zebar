let activeCount = 0;

export function beginFileDialog(): void {
  activeCount++;
}

export function endFileDialog(): void {
  activeCount = Math.max(0, activeCount - 1);
}

export function isFileDialogActive(): boolean {
  return activeCount > 0;
}
