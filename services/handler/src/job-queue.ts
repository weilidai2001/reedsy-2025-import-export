// Job queue and processing pipeline for Handler Service
import { Job, JobStatus } from "./types";
import logger from "./logger";
import { config } from "./config";
import { TaskRegistryClient } from "./task-registry-client";

export class JobQueue {
  private queue: Job[] = [];
  private processing: Set<string> = new Set();
  private maxConcurrent: number;
  private taskRegistryClient: TaskRegistryClient;

  constructor(taskRegistryClient: TaskRegistryClient) {
    this.maxConcurrent = config.maxConcurrentJobs;
    this.taskRegistryClient = taskRegistryClient;
  }

  public addJob(job: Job) {
    logger.info(`Adding job ${job.id} to queue`);
    this.queue.push(job);
    this.processJobs();
  }

  private async processJobs() {
    while (this.processing.size < this.maxConcurrent && this.queue.length > 0) {
      const job = this.queue.shift();
      if (job && !this.processing.has(job.id)) {
        this.processing.add(job.id);
        this.processJob(job).finally(() => {
          this.processing.delete(job.id);
          this.processJobs();
        });
      }
    }
  }

  private async processJob(job: Job) {
    try {
      await this.taskRegistryClient.updateJobState(job.id, "processing");
      logger.info(`Processing job ${job.id} (${job.direction} ${job.type})`);
      const delay = this.getDelayForJobType(job.direction, job.type);
      await new Promise((resolve) => setTimeout(resolve, delay * 1000));
      const resultUrl = `https://results.example.com/${job.id}.${job.type}`;
      await this.taskRegistryClient.updateJobResult(
        job.id,
        "finished",
        resultUrl
      );
      logger.info(`Job ${job.id} finished. Result: ${resultUrl}`);
    } catch (error) {
      logger.error(`Failed to process job ${job.id}: ${error}`);
      await this.taskRegistryClient.updateJobState(job.id, "failed");
    }
  }

  private getDelayForJobType(direction: string, type: string): number {
    if (direction === "import") return 60;
    if (direction === "export" && type === "pdf") return 25;
    if (direction === "export" && type === "epub") return 10;
    return 10;
  }
}
