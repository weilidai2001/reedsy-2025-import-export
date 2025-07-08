import { Job } from "../../shared/types";
import { state } from "./job-state";

const SIMULATED_PROCESS_TIMES: Record<string, number> = {
  epub: 10000,
  pdf: 25000,
  word: 60000,
  wattpad: 60000,
  evernote: 60000,
};

export async function processJob(job: Job): Promise<void> {
  state.currentJob = job.requestId;

  const duration = SIMULATED_PROCESS_TIMES[job.type];
  if (!duration) throw new Error(`Unsupported job type: ${job.type}`);

  await new Promise((resolve) => setTimeout(resolve, duration));
}
