import axios from "axios";
import { Job, JobSchema } from "./types";
import { processJob } from "./job-processor";
import { state } from "./job-state";
import logger from "./logger";
import { dequeue } from "./clients/scheduler-client";
import { updateRegistry } from "./clients/task-registry-client";

const POLL_INTERVAL_MS = 5000;

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

  logger.info("Starting job", { requestId: job.requestId });

  await updateRegistry({ ...job, state: "processing" });

  try {
    const processedJob = await processJob(job);
    const duration = Date.now() - start;
    await updateRegistry({ ...processedJob, state: "finished" });

    state.recordSuccess(processedJob.requestId, duration);
    logger.info("Finished job", {
      requestId: processedJob.requestId,
    });
  } catch (err: any) {
    const duration = Date.now() - start;
    await updateRegistry({ ...job, state: "failed" });
    state.recordFailure(job.requestId, duration, err);
    logger.error("Failed job", {
      requestId: job.requestId,
      error: err?.message || String(err),
    });
  } finally {
    state.setIdle(true);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
