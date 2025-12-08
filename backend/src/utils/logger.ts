import { config } from '@/config/settings';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class Logger {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = config.LOG_LEVEL;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private formatMessage(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  error(message: string, error?: Error | unknown, meta?: unknown): void {
    if (!this.shouldLog('error')) return;

    const errorMeta =
      error instanceof Error
        ? { ...(meta as Record<string, unknown>), error: error.message, stack: error.stack }
        : { ...(meta as Record<string, unknown>), error: String(error) };

    console.error(this.formatMessage('error', message, errorMeta));
  }

  warn(message: string, meta?: unknown): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, meta));
  }

  info(message: string, meta?: unknown): void {
    if (!this.shouldLog('info')) return;
    console.info(this.formatMessage('info', message, meta));
  }

  debug(message: string, meta?: unknown): void {
    if (!this.shouldLog('debug')) return;
    console.debug(this.formatMessage('debug', message, meta));
  }
}

export const logger = new Logger();
