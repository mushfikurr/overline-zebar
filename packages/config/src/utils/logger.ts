const PREFIX = '[overline-zebar/config]';

export const logger = {
  log: (message: string, ...args: any[]) => {
    console.log(`${PREFIX} ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`${PREFIX} ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`${PREFIX} ${message}`, ...args);
  },
};
