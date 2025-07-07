import app from './app';
import { config } from './config';
import logger from './logger';

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { err });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
  process.exit(1);
});

const PORT = config.port;
logger.info(`Attempting to start Receptionist service on port ${PORT}`);

try {
  app.listen(PORT, () => {
    logger.info(`Receptionist service listening on port ${PORT}`);
  });
} catch (err) {
  logger.error('Error starting server', { err });
  process.exit(1);
}
