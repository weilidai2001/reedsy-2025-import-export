import { Job } from "../types";
import { QueueService } from "./queue-interface";

// Single FIFO queue for all jobs
const queue: Job[] = [];

/**
 * Add a job to the end of the queue
 */
function enqueueJob(job: Job): void {
  queue.push(job);
}

/**
 * Remove and return the job at the front of the queue
 * Returns undefined if queue is empty
 */
function dequeueJob(): Job | undefined {
  if (queue.length === 0) return undefined;
  return queue.shift() || undefined;
}

export const queueService: QueueService & { getQueueLength: () => number } = {
  sendToQueue: (job: Job) => Promise.resolve(enqueueJob(job)),
  consume: () => Promise.resolve(dequeueJob()),
  getQueueLength: () => queue.length,
};
