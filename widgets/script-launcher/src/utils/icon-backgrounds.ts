export const ICON_BACKGROUND_NONE = 'none';

export interface IconBackgroundPreset {
  id: string;
  label: string;
  from: string;
  to: string;
  icon: string;
}

export const iconBackgroundPresets: IconBackgroundPreset[] = [
  {
    id: 'blue',
    label: 'Blue',
    from: '#60a5fa',
    to: '#2563eb',
    icon: '#ffffff',
  },
  {
    id: 'indigo',
    label: 'Indigo',
    from: '#818cf8',
    to: '#4f46e5',
    icon: '#ffffff',
  },
  {
    id: 'violet',
    label: 'Violet',
    from: '#a78bfa',
    to: '#7c3aed',
    icon: '#ffffff',
  },
  {
    id: 'pink',
    label: 'Pink',
    from: '#f472b6',
    to: '#db2777',
    icon: '#ffffff',
  },
  { id: 'red', label: 'Red', from: '#f87171', to: '#dc2626', icon: '#ffffff' },
  {
    id: 'orange',
    label: 'Orange',
    from: '#fb923c',
    to: '#ea580c',
    icon: '#ffffff',
  },
  {
    id: 'amber',
    label: 'Amber',
    from: '#fbbf24',
    to: '#d97706',
    icon: '#ffffff',
  },
  {
    id: 'green',
    label: 'Green',
    from: '#4ade80',
    to: '#16a34a',
    icon: '#ffffff',
  },
  {
    id: 'teal',
    label: 'Teal',
    from: '#2dd4bf',
    to: '#0d9488',
    icon: '#ffffff',
  },
  {
    id: 'graphite',
    label: 'Graphite',
    from: '#94a3b8',
    to: '#475569',
    icon: '#ffffff',
  },
];

export interface ResolvedIconBackground {
  background?: string;
  iconColor?: string;
}

export const iconBackgroundGradient = (preset: IconBackgroundPreset) =>
  `linear-gradient(135deg, ${preset.from}, ${preset.to})`;

export const defaultIconBackground: ResolvedIconBackground = {
  background:
    'linear-gradient(135deg, var(--primary-border, var(--primary)), var(--primary))',
  iconColor: 'var(--primary-text, #ffffff)',
};

export function resolveIconBackground(
  iconColor?: string
): ResolvedIconBackground {
  if (iconColor === ICON_BACKGROUND_NONE) return {};

  const preset = iconBackgroundPresets.find(
    (candidate) => candidate.id === iconColor
  );
  if (preset) {
    return {
      background: iconBackgroundGradient(preset),
      iconColor: preset.icon,
    };
  }

  return defaultIconBackground;
}
