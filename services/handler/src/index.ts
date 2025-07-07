// Entry point for Handler microservice
import { JobAcquisitionManager } from './job-acquisition';
import { LogBookClient } from './logbook-client';
import logger from './logger';

const logbookClient = new LogBookClient();
const jobAcquisitionManager = new JobAcquisitionManager(logbookClient);
jobAcquisitionManager.startPolling();

process.on('SIGINT', () => {
  logger.info('Gracefully stopping job polling...');
  jobAcquisitionManager.stopPolling();
  process.exit(0);
});
