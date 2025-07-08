import express from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { enqueueJob, dequeueJob, getAllJobs } from "./queue-manager";
import { updateMetrics } from "./scheduler-state";
import { Job } from "../../shared/types";
import axios from "axios";
import logger from "./logger";

export const queueRouter = express.Router();

const EnqueueSchema = z.object({
  requestId: z.string().uuid(),
  direction: z.enum(["import", "export"]),
  type: z.enum(["epub", "pdf", "word", "wattpad", "evernote"]),
});

queueRouter.post("/", (req, res) => {
  logger.info("Received job enqueue request", { body: req.body });

  const parsed = EnqueueSchema.safeParse(req.body);
  if (!parsed.success) {
    logger.warn("Invalid job format received", { errors: parsed.error.errors });
    return res.status(400).send("Invalid job format");
  }

  const now = new Date().toISOString();
  const job: Job = {
    ...parsed.data,
    bookId: uuidv4(),
    state: "pending",
    createdAt: now,
    updatedAt: now,
  };

  logger.info("Enqueuing job", {
    jobId: job.requestId,
    direction: job.direction,
    type: job.type,
  });
  enqueueJob(job);
  updateMetrics("enqueue", job.requestId);

  logger.info("Job enqueued successfully", { jobId: job.requestId });
  return res.sendStatus(204);
});

queueRouter.post("/dequeue", (req, res) => {
  logger.info("Received job dequeue request");

  const job = dequeueJob();
  if (!job) {
    logger.info("No jobs available for dequeue");
    return res.sendStatus(204);
  }

  logger.info("Dequeuing job", {
    jobId: job.requestId,
    direction: job.direction,
    type: job.type,
  });
  updateMetrics("dequeue", job.requestId);

  logger.info("Job dequeued successfully", { jobId: job.requestId });
  return res.json(job);
});

queueRouter.get("/", (req, res) => {
  const jobs = getAllJobs();
  return res.json(jobs);
});
