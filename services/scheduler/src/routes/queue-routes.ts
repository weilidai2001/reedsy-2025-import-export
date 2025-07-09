import express, { Request, Response } from "express";
import { enqueueJob, dequeueJob } from "../queue-manager";
import { updateMetrics } from "../scheduler-state";
import { Job, JobSchema } from "../types";
import logger from "../logger";
import { validate } from "../middleware/validate";

export const queueRouter = express.Router();

queueRouter.post("/", validate(JobSchema), (req: Request, res: Response) => {
  logger.info("Received job enqueue request", { body: req.body });

  const job: Job = req.body;

  enqueueJob(job);
  updateMetrics("enqueue", job.requestId);

  logger.info("Job enqueued successfully", { requestId: job.requestId });
  return res.status(201).json(job);
});

queueRouter.post("/dequeue", (req, res) => {
  logger.info("Received job dequeue request");

  const job: Job | null = dequeueJob();
  if (!job) {
    logger.info("No jobs available for dequeue");
    return res.status(204).json({ message: "No jobs available for dequeue" });
  }

  updateMetrics("dequeue", job.requestId);

  logger.info("Job dequeued successfully", { requestId: job.requestId });
  return res.status(200).json(job);
});
