import { Job } from "../types";
import { state } from "./job-state";

// Simulated processing times per requirements (in ms)
function getSimulatedProcessTime(job: Job): number {
  if (job.direction === "import") {
    return 60000; // import (any): 60s
  }
  if (job.direction === "export") {
    if (job.type === "epub") return 10000; // ePub export: 10s
    if (job.type === "pdf") return 25000; // PDF export: 25s
    return 60000; // fallback for other export types
  }
  throw new Error(`Unsupported job direction: ${job.direction}`);
}

const generateRandomUrl = () => {
  return `https://example.com/${Math.random().toString(36).substring(2, 9)}`;
};

export async function processJob(job: Job): Promise<Job> {
  state.currentJob = job.requestId;

  const duration = getSimulatedProcessTime(job);
  await new Promise((resolve) => setTimeout(resolve, duration));

  return {
    ...job,
    resultUrl: generateRandomUrl(),
  };
}
