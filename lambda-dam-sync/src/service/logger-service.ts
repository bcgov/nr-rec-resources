import pino from 'pino';

export class LoggerService {
  private logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  });

  log(message: string, meta?: any) {
    this.logger.info(meta || {}, message);
  }

  error(message: string, meta?: any) {
    this.logger.error(meta || {}, message);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(meta || {}, message);
  }
}
