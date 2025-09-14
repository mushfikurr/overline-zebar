import type { Config } from 'tailwindcss';

// Allows opacity with OKLCH values. (i.e. bg-background/80)
function withOpacity(variableName: string) {
  return ({ opacityValue }: { opacityValue: number }) => {
    if (opacityValue === 100) return `var(${variableName})`;
    return `color-mix(in srgb, var(${variableName}) calc(${opacityValue} * 100%), transparent)`;
  };
}

// Allow widgets to define their own content
const config: Omit<Config, 'content'> = {
  theme: {
    extend: {
      colors: {
        background: withOpacity('--background'),
        border: withOpacity('--border'),
        'background-deeper': withOpacity('--background-deeper'),
        button: withOpacity('--button'),
        'button-border': withOpacity('--button-border'),
        primary: withOpacity('--primary'),
        'primary-border': withOpacity('--primary-border'),
        'primary-text': withOpacity('--primary-text'),
        text: withOpacity('--text'),
        'text-muted': withOpacity('--text-muted'),
        icon: withOpacity('--icon'),
        success: 'var(--success)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
      },
      fontFamily: {
        mono: ['Geist Mono', 'monospace'],
      },
      fontSize: {
        'xs': '10px',
        'sm': '11px',
        'base': '12px',
        'md': '13px',
        'lg': '14px',
        'xl': '16px',
      },
      spacing: {
        'px': '1px',
        '0': '0',
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '3.5': '14px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
      },
      borderRadius: {
        sm: 'calc(var(--radius) * 0.75)',
        md: 'var(--radius)',
        lg: 'calc(var(--radius) * 1.25)',
        xl: 'calc(var(--radius) * 1.5)',
        '2xl': 'calc(var(--radius) * 2)',
        '3xl': 'calc(var(--radius) * 2.5)',
        DEFAULT: 'var(--radius)',
      },
    },
  },
  plugins: [],
};
export default config;