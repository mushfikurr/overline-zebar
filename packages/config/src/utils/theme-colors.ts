import { parseHexColor } from './parseHexColor';

/** Strip the alpha channel from a hex color, returning an opaque #rrggbb. */
export function stripAlpha(hex: string): string {
  const [r, g, b] = parseHexColor(hex);
  if ([r, g, b].some(Number.isNaN)) return hex;
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Returns the theme color map with a derived opaque `--surface` token.
 *
 * `--surface` is the alpha-stripped form of `--background`, so content
 * surfaces (headers, dropdowns, popovers) stay readable regardless of the
 * transparency the user applies to `--background` (e.g. to reveal acrylic).
 */
export function withDerivedThemeColors(
  colors: Record<string, string>
): Record<string, string> {
  const background = colors['--background'];
  if (!background) return colors;
  return { ...colors, '--surface': stripAlpha(background) };
}
