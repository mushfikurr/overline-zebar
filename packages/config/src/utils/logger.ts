export enum LogLevel {
  None = 0,
  Error = 1,
  Warn = 2,
  Log = 3,
}

const PREFIX = '[overline-zebar/config]';

export const logger = {
  level: LogLevel.Log,

  log(...args: unknown[]) {
    if (this.level >= LogLevel.Log) {
      console.log(PREFIX, ...args);
    }
  },

  warn(...args: unknown[]) {
    if (this.level >= LogLevel.Warn) {
      console.warn(PREFIX, ...args);
    }
  },

  error(...args: unknown[]) {
    if (this.level >= LogLevel.Error) {
      console.error(PREFIX, ...args);
    }
  },
};
