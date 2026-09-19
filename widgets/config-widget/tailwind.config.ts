import type { Config } from 'tailwindcss';
import sharedConfig from '@overline-zebar/tailwind';

const config: Pick<Config, 'prefix' | 'presets' | 'content'> = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.tsx',
    '../script-launcher/src/**/*.{ts,tsx}',
  ],
  presets: [sharedConfig],
};

export default config;
