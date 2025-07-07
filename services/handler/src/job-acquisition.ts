// Responsible for polling the Scheduler for new jobs and managing job subscriptions
import axios from "axios";
import logger from "./logger";
import { config } from "./config";
import { Job } from "./types";

import { LogBookClient } from "./logbook-client";

export class JobAcquisitionManager {
  private pollingInterval: number;
  private schedulerUrl: string;
  private isPolling: boolean = false;
  private activeJobs: Set<string> = new Set();
  private logbook: LogBookClient;

  constructor(logbook: LogBookClient) {
    this.pollingInterval = config.pollingInterval;
    this.schedulerUrl = config.schedulerUrl;
    this.logbook = logbook;
  }

  public startPolling() {
    if (this.isPolling) return;
    this.isPolling = true;
    logger.info("Starting job polling from Scheduler...");
    this.poll();
  }

  public stopPolling() {
    this.isPolling = false;
    logger.info("Stopped job polling.");
  }

  private async poll() {
    while (this.isPolling) {
      try {
        logger.debug("Polling Scheduler for new jobs...");
        const response = await axios.get<Job[]>(
          `${this.schedulerUrl}/jobs/available`
        );
        const jobs = response.data;
        if (jobs.length > 0) {
          logger.info(`Acquired ${jobs.length} job(s) from Scheduler.`);
          for (const job of jobs) {
            if (!this.activeJobs.has(job.id)) {
              this.activeJobs.add(job.id);
              await this.acknowledgeJob(job.id);
              logger.info(`Job ${job.id} acknowledged. Starting processing.`);
              this.processJob(job);
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
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async processJob(job: Job) {
    try {
      await this.logbook.updateJobState(job.id, "processing");
      logger.info(`Processing job ${job.id} (${job.direction} ${job.type})`);
      const delay = this.getDelayForJobType(job.direction, job.type);
      await new Promise((resolve) => setTimeout(resolve, delay * 1000));
      const resultUrl = `https://results.example.com/${job.id}.${job.type}`;
      await this.logbook.updateJobResult(job.id, "finished", resultUrl);
      logger.info(`Job ${job.id} finished. Result: ${resultUrl}`);
    } catch (error) {
      logger.error(`Failed to process job ${job.id}: ${error}`);
      await this.logbook.updateJobState(job.id, "failed");
    }
  }

  private getDelayForJobType(direction: string, type: string): number {
    if (direction === "import") return 60;
    if (direction === "export" && type === "pdf") return 25;
    if (direction === "export" && type === "epub") return 10;
    return 10;
  }

  public getActiveJobs() {
    return Array.from(this.activeJobs);
  }
}
