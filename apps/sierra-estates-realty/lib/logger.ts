import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = isDev
  ? {
      info: (msg: any, ...args: any[]) => console.log(`[INFO]`, msg, ...args),
      error: (msg: any, ...args: any[]) => console.error(`[ERROR]`, msg, ...args),
      warn: (msg: any, ...args: any[]) => console.warn(`[WARN]`, msg, ...args),
      debug: (msg: any, ...args: any[]) => console.debug(`[DEBUG]`, msg, ...args),
    } as any
  : pino({
      level: process.env.LOG_LEVEL || 'info',
    });

