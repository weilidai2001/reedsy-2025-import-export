import express, { Request, Response } from "express";
import { z } from "zod";
import { enqueueJob, dequeueJob, getAllJobs } from "./queue-manager";
import { updateMetrics } from "./scheduler-state";
import { JobSchema } from "./types";
import logger from "./logger";

export const queueRouter = express.Router();

queueRouter.post("/", (req: Request, res: Response) => {
  logger.info("Received job enqueue request", { body: req.body });

  const parsed = JobSchema.safeParse(req.body);
  if (!parsed.success) {
    logger.warn("Invalid job format received", { errors: parsed.error.errors });
    return res.status(400).send("Invalid job format");
  }

  const job = parsed.data;

  enqueueJob(job);
  updateMetrics("enqueue", job.requestId);

  logger.info("Job enqueued successfully", { requestId: job.requestId });
  return res.sendStatus(201);
});

queueRouter.post("/dequeue", (req, res) => {
  logger.info("Received job dequeue request");

  const job = dequeueJob();
  if (!job) {
    logger.info("No jobs available for dequeue");
    return res.sendStatus(204);
  }

  logger.info("Dequeuing job", {
    requestId: job.requestId,
    direction: job.direction,
    type: job.type,
  });
  updateMetrics("dequeue", job.requestId);

  logger.info("Job dequeued successfully", { requestId: job.requestId });
  return res.json(job);
});

queueRouter.get("/", (req, res) => {
  const jobs = getAllJobs();
  return res.json(jobs);
});
