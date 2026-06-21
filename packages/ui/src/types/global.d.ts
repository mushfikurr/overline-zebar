interface EyeDropper {
  open(): Promise<{ sRGBHex: string }>;
}

interface Window {
  EyeDropper?: new () => EyeDropper;
  queryLocalFonts?: (options?: {
    postscriptNames?: string[];
  }) => Promise<FontData[]>;
}

interface FontData {
  readonly family: string;
  readonly fullName: string;
  readonly postscriptName: string;
  readonly style: string;
}
