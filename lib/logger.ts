/**
 * Structured Logger
 * 
 * Provides structured logging with different log levels
 * Integrates with Sentry for error tracking
 */

import * as Sentry from '@sentry/nextjs';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    
    const logObject = {
      level,
      message,
      timestamp,
      ...(context && { context }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };

    return JSON.stringify(logObject);
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formattedLog = this.formatLog(entry);

    // Log to console based on level
    switch (level) {
      case LogLevel.DEBUG:
        if (process.env.NODE_ENV === 'development') {
          console.debug(formattedLog);
        }
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        // Send warnings to Sentry
        Sentry.captureMessage(message, {
          level: 'warning',
          contexts: { custom: context },
        });
        break;
      case LogLevel.ERROR:
        console.error(formattedLog);
        // Send errors to Sentry
        if (error) {
          Sentry.captureException(error, {
            contexts: { custom: context },
          });
        } else {
          Sentry.captureMessage(message, {
            level: 'error',
            contexts: { custom: context },
          });
        }
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: LogContext): Logger {
    const childLogger = new Logger();
    const originalLog = childLogger.log.bind(childLogger);

    childLogger.log = (level: LogLevel, message: string, context?: LogContext, error?: Error) => {
      const mergedContext = { ...additionalContext, ...context };
      originalLog(level, message, mergedContext, error);
    };

    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: LogContext) => logger.error(message, error, context),
};
