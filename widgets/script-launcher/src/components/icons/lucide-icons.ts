import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

const iconModules = import.meta.glob<LucideIcon>(
  '/node_modules/lucide-react/dist/esm/icons/*.js',
  { import: 'default' }
);

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

export const lucideIconNames: string[] = Object.keys(iconModules)
  .map(fileNameToIconName)
  .sort((a, b) => a.localeCompare(b));

export const isKnownLucideIcon = (name?: string) =>
  !!name && iconModules[toChunkKey(name)] !== undefined;

export const searchLucideIcons = (query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return lucideIconNames;
  return lucideIconNames.filter((name) => name.toLowerCase().includes(q));
};

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
