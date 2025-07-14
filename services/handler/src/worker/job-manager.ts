import { Job } from "../types";
import { state } from "./job-state";
import logger from "../logger";
import { updateRegistry } from "../clients/task-registry-client";
import { processJob } from "./job-processor";

export async function handleJob(job: Job) {
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
