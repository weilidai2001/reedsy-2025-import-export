import axios from "axios";
import logger from "../logger";
import { Job } from "../types";

export const updateRegistry = async (job: Job) => {
  try {
    const now = new Date().toISOString();
    await axios.put(
      `${process.env.TASK_REGISTRY_URL}/jobs/${job.requestId}`,
      { ...job, updatedAt: now } as Job,
      {
        timeout: 5000,
        validateStatus: (status) => status === 204,
      }
    );
    logger.debug("Updated job state", { requestId: job.requestId });
  } catch (err: any) {
    const status = err.response?.status;
    const data = err.response?.data;

    logger.error("Failed to update job state", {
      requestId: job.requestId,
      error: err?.message || String(err),
      status,
      data,
    });

    // Re-throw to be handled by the caller
    throw err;
  }
};
