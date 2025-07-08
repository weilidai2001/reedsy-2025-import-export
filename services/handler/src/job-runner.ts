import axios from "axios";
import { Job, JobState, validateJobSchema } from "../../shared/types";
import { processJob } from "./job-processor";
import { state } from "./job-state";
import logger from "./logger";

const POLL_INTERVAL_MS = 5000;
const SCHEDULER_URL = process.env.SCHEDULER_URL!;
const REGISTRY_URL = process.env.TASK_REGISTRY_URL!;

export async function startPollingLoop() {
  while (true) {
    if (!state.isIdle) {
      await delay(1000);
      continue;
    }

    try {
      const { data: jobs } = await axios.get<any[]>(`${SCHEDULER_URL}/queue`);
      if (jobs.length === 0) {
        await delay(POLL_INTERVAL_MS);
        continue;
      }

      const { data: job } = await axios.post<any>(`${SCHEDULER_URL}/queue/dequeue`);
      const parsed = validateJobSchema.safeParse(job);
      if (!parsed.success) {
        logger.error("Invalid job schema", { jobId: job?.id || 'unknown', errors: parsed.error.format() });
        continue;
      }

      await handleJob(parsed.data);
    } catch (err: any) {
      logger.error("Polling error", { error: err?.message || String(err) });
      await delay(POLL_INTERVAL_MS);
    }
  }
}

async function handleJob(job: Job) {
  state.setIdle(false);
  const start = Date.now();

  logger.info("Starting job", {
    jobId: job.id,
    type: job.type,
    direction: job.direction,
    state: "startingProcessing",
  });

  await patchJobState(job.id, "processing");

  try {
    await processJob(job);
    const duration = Date.now() - start;
    await patchJobState(job.id, "finished");

    state.recordSuccess(job.id, duration);
    logger.info("Finished job", {
      jobId: job.id,
      type: job.type,
      direction: job.direction,
      state: "finishedProcessing",
    });
  } catch (err: any) {
    const duration = Date.now() - start;
    await patchJobState(job.id, "failed");
    state.recordFailure(job.id, duration, err);
    logger.error("Failed job", {
      jobId: job.id,
      error: err?.message || String(err),
    });
  } finally {
    state.setIdle(true);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function patchJobState(id: string, state: JobState) {
  await axios.patch(`${REGISTRY_URL}/jobs/${id}`, { state });
}
