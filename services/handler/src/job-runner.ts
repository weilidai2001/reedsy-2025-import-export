import axios from "axios";
import { Job, JobSchema } from "./types";
import { processJob } from "./job-processor";
import { state } from "./job-state";
import logger from "./logger";
import { dequeue } from "./clients/scheduler-client";

const POLL_INTERVAL_MS = 5000;
const REGISTRY_URL = process.env.TASK_REGISTRY_URL!;

export async function startPollingLoop() {
  logger.info("Starting job polling loop");

  await delay(2000); // Initial delay to allow scheduler to start

  while (true) {
    if (!state.isIdle) {
      await delay(1000);
      continue;
    }

    const job = await dequeue();

    if (!job) {
      logger.info("No jobs available for dequeue");
      await delay(POLL_INTERVAL_MS);
      continue;
    }

    await handleJob(job);
  }
}

async function handleJob(job: Job) {
  state.setIdle(false);
  const start = Date.now();

  logger.info("Starting job", {
    jobId: job.requestId,
    type: job.type,
    direction: job.direction,
    state: "startingProcessing",
  });

  await patchJobState(job.requestId, "processing");

  try {
    await processJob(job);
    const duration = Date.now() - start;
    await patchJobState(job.requestId, "finished");

    state.recordSuccess(job.requestId, duration);
    logger.info("Finished job", {
      jobId: job.requestId,
      type: job.type,
      direction: job.direction,
      state: "finishedProcessing",
    });
  } catch (err: any) {
    const duration = Date.now() - start;
    await patchJobState(job.requestId, "failed");
    state.recordFailure(job.requestId, duration, err);
    logger.error("Failed job", {
      jobId: job.requestId,
      error: err?.message || String(err),
    });
  } finally {
    state.setIdle(true);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function patchJobState(id: string, state: string) {
  try {
    await axios.patch(
      `${REGISTRY_URL}/jobs/${id}`,
      { state },
      {
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 300,
      }
    );
    logger.debug("Updated job state", { jobId: id, state });
  } catch (err: any) {
    const status = err.response?.status;
    const data = err.response?.data;

    logger.error("Failed to update job state", {
      jobId: id,
      state,
      error: err?.message || String(err),
      status,
      data,
    });

    // Re-throw to be handled by the caller
    throw err;
  }
}
