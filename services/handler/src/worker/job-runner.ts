import { state } from "./job-state";
import logger from "../logger";
import { dequeue } from "../clients/scheduler-client";
import { handleJob } from "./job-manager";

const POLL_INTERVAL_MS = 5000;

export async function runSinglePollIteration() {
  if (!state.isIdle) {
    await delay(1000);
    return;
  }

  const job = await dequeue();

  if (!job) {
    logger.info("No jobs available for dequeue");
    await delay(POLL_INTERVAL_MS);
    return;
  }

  await handleJob(job);
}

export async function startPollingLoop() {
  logger.info("Starting job polling loop");

  await delay(2000); // Initial delay to allow scheduler to start
  // (in real world, this shouldn't be needed as the scheduler will always be up)

  while (true) {
    await runSinglePollIteration();
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
