export interface FontData {
  readonly family: string;
  readonly fullName: string;
  readonly postscriptName: string;
  readonly style: string;
}

export interface FontQueryWindow extends Window {
  queryLocalFonts?: (options?: {
    postscriptNames?: string[];
  }) => Promise<FontData[]>;
}

/**
 * Reports whether the Local Font Access API
 * (`window.queryLocalFonts`) is available in the current environment.
 */
export function useLocalFontAccess(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof (window as FontQueryWindow).queryLocalFonts === 'function'
  );
}
