import tinycolor from 'tinycolor2';
import { Theme } from '../types';
import { generateId } from './generateId';

export const generateThemeFromColor = (baseColor: string): Theme => {
  const base = tinycolor(baseColor);
  const isLight = base.isLight();

  const background = base.toHexString();
  const backgroundDeeper = isLight
    ? base.clone().darken(8).toHexString()
    : base.clone().lighten(8).toHexString();

  const border = isLight
    ? base.clone().darken(16).toHexString()
    : base.clone().lighten(16).toHexString();

  const button = isLight
    ? base.clone().darken(8).toHexString()
    : base.clone().lighten(8).toHexString();
  const buttonBorder = isLight
    ? base.clone().darken(24).toHexString()
    : base.clone().lighten(24).toHexString();

  const primary = baseColor;
  const primaryBorder = isLight
    ? base.clone().darken(16).toHexString()
    : base.clone().lighten(16).toHexString();
  const primaryText = tinycolor
    .mostReadable(primary, ['#ffffff', '#000000'])
    .toHexString();

  const text = (() => {
    const idealTextColor = isLight ? tinycolor('black') : tinycolor('white');
    // Try to create a tinted text color that has enough contrast
    for (const amount of [30, 25, 20, 15, 10, 5]) {
      const tinted = tinycolor.mix(idealTextColor, base, amount);
      if (tinycolor.readability(background, tinted) >= 5.5) {
        return tinted.toHexString();
      }
    }
    // Fallback to the most readable of black or white if no tinted version is readable
    return tinycolor
      .mostReadable(background, ['#ffffff', '#000000'])
      .toHexString();
  })();
  const textMuted = tinycolor(text).setAlpha(0.8).toRgbString();
  const icon = tinycolor(text).spin(10).toHexString();

  // '--success': '#a3be8c',
  //  '--danger': '#bf616a',
  //  '--warning': '#d08770',

  const newThemeColors: Record<string, string> = {
    '--background': background,
    '--background-deeper': backgroundDeeper,
    '--border': border,
    '--button': button,
    '--button-border': buttonBorder,
    '--primary': primary,
    '--primary-border': primaryBorder,
    '--primary-text': primaryText,
    '--text': text,
    '--text-muted': textMuted,
    '--icon': icon,
    '--success': '#a3b38c',
    '--danger': '#bf616a',
    '--warning': '#d08770',
  };

  return {
    id: generateId(),
    name: `Generated Theme - ${baseColor}`,
    colors: newThemeColors,
  };
};
