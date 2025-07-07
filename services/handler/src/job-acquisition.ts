// Responsible for polling the Scheduler for new jobs and managing job subscriptions
import axios from 'axios';
import logger from './logger';
import { config } from './config';
import { Job } from './types';

export class JobAcquisitionManager {
  private pollingInterval: number;
  private schedulerUrl: string;
  private isPolling: boolean = false;
  private activeJobs: Set<string> = new Set();

  constructor() {
    this.pollingInterval = config.pollingInterval;
    this.schedulerUrl = config.schedulerUrl;
  }

  public startPolling() {
    if (this.isPolling) return;
    this.isPolling = true;
    logger.info('Starting job polling from Scheduler...');
    this.poll();
  }

  public stopPolling() {
    this.isPolling = false;
    logger.info('Stopped job polling.');
  }

  private async poll() {
    while (this.isPolling) {
      try {
        logger.debug('Polling Scheduler for new jobs...');
        const response = await axios.get<Job[]>(`${this.schedulerUrl}/jobs/available`);
        const jobs = response.data;
        if (jobs.length > 0) {
          logger.info(`Acquired ${jobs.length} job(s) from Scheduler.`);
          for (const job of jobs) {
            if (!this.activeJobs.has(job.id)) {
              this.activeJobs.add(job.id);
              // Acknowledge job receipt (pseudo-code, to be implemented)
              await this.acknowledgeJob(job.id);
              // Here, you would push the job to the processing queue
              logger.info(`Job ${job.id} acknowledged and queued.`);
            }
          }
        }
      } catch (error) {
        logger.error(`Error polling Scheduler: ${error}`);
      }
      await this.delay(this.pollingInterval);
    }
  }

  private async acknowledgeJob(jobId: string) {
    try {
      await axios.post(`${this.schedulerUrl}/jobs/${jobId}/ack`);
      logger.debug(`Acknowledged job ${jobId} to Scheduler.`);
    } catch (error) {
      logger.error(`Failed to acknowledge job ${jobId}: ${error}`);
    }
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public getActiveJobs() {
    return Array.from(this.activeJobs);
  }
}
