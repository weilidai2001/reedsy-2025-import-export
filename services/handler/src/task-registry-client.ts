// TaskRegistry client for updating job state and results
import axios from "axios";
import { config } from "./config";
import logger from "./logger";
import { JobStatus } from "./types";

export class TaskRegistryClient {
  private url: string;

  constructor() {
    this.url = config.taskRegistryUrl;
  }

  public async updateJobState(jobId: string, status: JobStatus): Promise<void> {
    try {
      await axios.patch(`${this.url}/jobs/${jobId}/status`, { status });
      logger.info(`Updated job ${jobId} state to ${status} in TaskRegistry.`);
    } catch (error) {
      logger.error(`Failed to update state for job ${jobId}: ${error}`);
      throw error;
    }
  }

  public async updateJobResult(
    jobId: string,
    status: JobStatus,
    resultUrl?: string
  ): Promise<void> {
    try {
      await axios.patch(`${this.url}/jobs/${jobId}/result`, {
        status,
        resultUrl,
      });
      logger.info(`Updated job ${jobId} result in TaskRegistry.`);
    } catch (error) {
      logger.error(`Failed to update result for job ${jobId}: ${error}`);
      throw error;
    }
  }
}
