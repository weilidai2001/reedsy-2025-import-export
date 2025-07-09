import express, { Request, Response } from "express";

import { z, ZodError } from "zod";
import logger from "./logger";
import {
  insertJob,
  selectAllJobs,
  selectJobById,
  selectJobsByDirection,
  updateJob,
} from "../database/job-repository";
import { JobSchema } from "./types";

const router = express.Router();

router.post("/jobs", async (req: Request, res: Response) => {
  try {
    const validatedData = JobSchema.safeParse(req.body);

    if (!validatedData.success) {
      const issues = validatedData.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      logger.warn("Zod validation failed", { issues });

      return res.status(400).json({
        error: "Validation failed",
        details: issues,
      });
    }

    const job = validatedData.data;

    logger.info("Creating job:", job);

    await insertJob(job);

    res.status(201).json(job);
  } catch (error) {
    logger.error("Internal server error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/jobs/:id", async (req: Request, res: Response) => {
  try {
    const validatedData = JobSchema.safeParse(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        error: "Validation error",
        details: validatedData.error.format(),
      });
    }

    await updateJob(validatedData.data);
    res.status(204).json();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }
    logger.error("Internal server error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/jobs", async (req: Request, res: Response) => {
  const jobs = req.query.direction
    ? await selectJobsByDirection(req.query.direction as "import" | "export")
    : await selectAllJobs();

  res.json(jobs);
});

router.get("/jobs/:id", async (req: Request, res: Response) => {
  const job = await selectJobById(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default router;
