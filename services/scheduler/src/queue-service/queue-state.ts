import express from "express";
import { queueService } from "./in-memory-queue";

let totalJobsEnqueued = 0;
let totalJobsDequeued = 0;
let lastDequeuedJobId: string | null = null;
const startTime = Date.now();

export function updateMetrics(action: "enqueue" | "dequeue", jobId: string) {
  if (action === "enqueue") totalJobsEnqueued++;
  if (action === "dequeue") {
    totalJobsDequeued++;
    lastDequeuedJobId = jobId;
  }
}

export const schedulerStateRouter = express.Router();

schedulerStateRouter.get("/", (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    totalJobsEnqueued,
    totalJobsDequeued,
    lastDequeuedJobId,
    queueLength: queueService.getQueueLength(),
    uptimeSeconds: uptime,
  });
});
