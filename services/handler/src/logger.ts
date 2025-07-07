// Logger setup using Winston (beginner-friendly)

import { createLogger, format, transports } from 'winston';
import { config } from './config';

const logger = createLogger({
  level: config.logLevel,
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [new transports.Console()],
});

export default logger;
