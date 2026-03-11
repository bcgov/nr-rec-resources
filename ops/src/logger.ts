/**
 * Shared Winston logger for ops scripts. Writes structured JSON to a timestamped
 * file under ops/logs/ and human-readable lines to stderr.
 */

import * as fs from 'fs';
import * as path from 'path';
import winston from 'winston';

const LOG_DIR = path.join(process.cwd(), 'logs');

function ensureLogDir(): string {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  return LOG_DIR;
}

function timestampedLogFileName(script: string): string {
  const iso = new Date().toISOString().slice(0, 19);
  const safe = iso.replace(/:/g, '-');
  return path.join(LOG_DIR, `${script}-${safe}.log`);
}

/**
 * Human-readable console format: [timestamp] level (script): message key=value ...
 */
const consoleFormat = winston.format.printf((info) => {
  const ts = info.timestamp ?? new Date().toISOString();
  const script = info.script ?? '?';
  const meta = { ...info } as Record<string, string>;
  delete meta.timestamp;
  delete meta.level;
  delete meta.message;
  delete meta.script;
  const metaStr = Object.keys(meta).length
    ? ' ' +
      Object.entries(meta)
        .map(([k, v]) => `${k}=${String(v)}`)
        .join(' ')
    : '';
  return `[${ts}] ${info.level} (${script}): ${info.message}${metaStr}`;
});

export type Logger = winston.Logger;

/**
 * Create a logger for a GuardDuty script run. Logs go to a new timestamped file
 * under ops/logs/ and to stderr. Respects LOG_LEVEL (default: info).
 */
export function createLogger(
  script: string,
  meta?: Record<string, string>,
): Logger {
  ensureLogDir();
  const logPath = timestampedLogFileName(script);
  const level = process.env.LOG_LEVEL ?? 'info';
  const defaultMeta = { script, ...meta };

  const timestampFormat = winston.format.timestamp({
    format: (): string => new Date().toISOString(),
  });

  return winston.createLogger({
    level,
    defaultMeta,
    format: winston.format.combine(
      timestampFormat,
      winston.format.errors({ stack: true }),
    ),
    transports: [
      new winston.transports.File({
        filename: logPath,
        format: winston.format.json(),
      }),
      new winston.transports.Console({
        stderrLevels: ['error', 'warn', 'info', 'debug'],
        format: winston.format.combine(
          winston.format.colorize(),
          timestampFormat,
          consoleFormat,
        ),
      }),
    ],
  });
}
