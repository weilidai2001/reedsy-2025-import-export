import express, { Request, Response } from "express";
import { updateMetrics } from "../queue-service/queue-state";
import { Job, JobSchema } from "../types";
import logger from "../logger";
import { validate } from "../middleware/validate";
import { queueService } from "../queue-service/in-memory-queue";

export const queueRouter = express.Router();

queueRouter.post(
  "/",
  validate(JobSchema),
  async (req: Request, res: Response) => {
    logger.info("Received job enqueue request", { body: req.body });

    const job: Job = req.body;

    await queueService.sendToQueue(job);
    updateMetrics("enqueue", job.requestId);

    logger.info("Job enqueued successfully", { requestId: job.requestId });
    return res.status(201).json(job);
  }
);

queueRouter.post("/dequeue", async (req, res) => {
  logger.info("Received job dequeue request");

  const job: Job | undefined = await queueService.consume();
  if (!job) {
    logger.info("No jobs available for dequeue");
    return res.status(204).json({ message: "No jobs available for dequeue" });
  }

  updateMetrics("dequeue", job.requestId);

  logger.info("Job dequeued successfully", { requestId: job.requestId });
  return res.status(200).json(job);
});
