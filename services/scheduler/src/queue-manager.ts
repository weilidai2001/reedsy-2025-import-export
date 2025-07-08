import { Job } from "../../shared/types";

// Single FIFO queue for all jobs
const queue: Job[] = [];

/**
 * Add a job to the end of the queue
 */
export function enqueueJob(job: Job): void {
  queue.push(job);
}

/**
 * Remove and return the job at the front of the queue
 * Returns null if queue is empty
 */
export function dequeueJob(): Job | null {
  if (queue.length === 0) return null;
  return queue.shift() || null;
}

/**
 * Get all jobs currently in the queue
 */
export function getAllJobs(): Job[] {
  return [...queue];
}

/**
 * Get the current queue length
 */
export function getQueueLength(): number {
  return queue.length;
}
