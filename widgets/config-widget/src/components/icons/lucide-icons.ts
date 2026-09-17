import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * Lazily exposes every Lucide icon without bloating the initial widget
 * bundle. Vite turns each matched module into its own tiny chunk, which is
 * only fetched when a specific icon is actually rendered.
 *
 * The pattern is intentionally root-relative: every widget that bundles
 * this shared source resolves it against its own lucide-react install.
 * The lucide-react version is pinned; if it changes, the internal icons
 * layout should be re-verified.
 */
const iconModules = import.meta.glob<LucideIcon>(
  '/node_modules/lucide-react/dist/esm/icons/*.js',
  { import: 'default' }
);

/** Fallback icon used when a saved name is unknown or missing. */
export const DEFAULT_ICON_NAME = 'Zap';

const fileNameToIconName = (filePath: string) =>
  (filePath.split('/').pop() ?? '')
    .replace(/\.js$/, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const toChunkKey = (name: string) =>
  `/node_modules/lucide-react/dist/esm/icons/${name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .toLowerCase()}.js`;

/** All icon names (PascalCase), sorted alphabetically. */
export const lucideIconNames: string[] = Object.keys(iconModules)
  .map(fileNameToIconName)
  .sort((a, b) => a.localeCompare(b));

export const isKnownLucideIcon = (name?: string) =>
  !!name && iconModules[toChunkKey(name)] !== undefined;

/** Case-insensitive search across icon names. */
export const searchLucideIcons = (query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return lucideIconNames;
  return lucideIconNames.filter((name) => name.toLowerCase().includes(q));
};

/**
 * Loads a single icon's chunk on demand. Returns the fallback icon for
 * unknown/missing names, and `null` while the chunk is in flight.
 */
export function useLucideIcon(name?: string): LucideIcon | null {
  const [Icon, setIcon] = useState<LucideIcon | null>(null);
  const resolved = name && isKnownLucideIcon(name) ? name : DEFAULT_ICON_NAME;

  useEffect(() => {
    let cancelled = false;
    const load = iconModules[toChunkKey(resolved)];
    if (!load) return;

    load().then((component) => {
      if (!cancelled) setIcon(component);
    });

    return () => {
      cancelled = true;
    };
  }, [resolved]);

  return Icon;
}
