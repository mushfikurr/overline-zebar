import type { Config } from 'tailwindcss';
import sharedConfig from '@overline-zebar/tailwind';

const config: Pick<Config, 'prefix' | 'presets' | 'content'> = {
  content: ['./src/**/*.tsx', '../../packages/ui/src/**/*.tsx'],
  presets: [sharedConfig],
};

export default config;
