type LogLevel = 'info' | 'error' | 'warn' | 'debug';

const log = (level: LogLevel, message: string, ...args: any[]) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, ...args);
};

export const logger = {
  info: (message: string, ...args: any[]) => log('info', message, ...args),
  error: (message: string, ...args: any[]) => log('error', message, ...args),
  warn: (message: string, ...args: any[]) => log('warn', message, ...args),
  debug: (message: string, ...args: any[]) => log('debug', message, ...args)
}; 