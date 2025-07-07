// Entry point for Handler microservice
import { JobAcquisitionManager } from './job-acquisition';
import logger from './logger';

const jobAcquisitionManager = new JobAcquisitionManager();
jobAcquisitionManager.startPolling();

process.on('SIGINT', () => {
  logger.info('Gracefully stopping job polling...');
  jobAcquisitionManager.stopPolling();
  process.exit(0);
});
