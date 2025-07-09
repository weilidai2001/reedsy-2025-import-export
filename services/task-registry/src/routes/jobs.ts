import express, { Request, Response } from "express";

import logger from "../logger";
import {
  insertJob,
  selectAllJobs,
  selectJobById,
  selectJobsByDirection,
  updateJob,
} from "../database/job-repository";
import { Job, JobSchema } from "../types";
import { validate } from "../middleware/validate";

const router = express.Router();

router.post(
  "/jobs",
  validate(JobSchema),
  async (req: Request, res: Response) => {
    try {
      const job = req.body as Job;

      logger.info("Creating job:", job);

      await insertJob(job);

      res.status(201).json(job);
    } catch (error) {
      logger.error("Internal server error while creating job", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.put(
  "/jobs/:id",
  validate(JobSchema),
  async (req: Request, res: Response) => {
    try {
      const job = req.body as Job;

      await updateJob(job);
      res.status(204).json();
    } catch (error) {
      logger.error("Internal server error while updating job", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/jobs", async (req: Request, res: Response) => {
  try {
    const jobs = req.query.direction
      ? await selectJobsByDirection(req.query.direction as "import" | "export")
      : await selectAllJobs();

    res.json(jobs);
  } catch (error) {
    logger.error("Internal server error while getting jobs", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/jobs/:id", async (req: Request, res: Response) => {
  try {
    const job = await selectJobById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (error) {
    logger.error("Internal server error while getting job", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
