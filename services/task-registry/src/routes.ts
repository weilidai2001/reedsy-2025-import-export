import express, { Request, Response } from "express";

import { z, ZodError } from "zod";
import logger from "./logger";
import {
  insertJob,
  selectAllJobs,
  selectJobById,
  selectJobsByDirection,
  updateJob,
} from "./persistence-util";
import {
  Job,
  TaskRegistryCreateJobSchema,
  TaskRegistryUpdateJobSchema,
} from "./types";

const router = express.Router();

// POST /jobs - Create a new job
router.post("/jobs", (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const validatedData = TaskRegistryCreateJobSchema.safeParse(req.body);

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

    insertJob(job);

    res.status(201).json(job);
  } catch (error) {
    logger.error("Internal server error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /jobs/:id - Update job state or result
router.patch("/jobs/:id", (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const validatedData = TaskRegistryUpdateJobSchema.safeParse(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        error: "Validation error",
        details: validatedData.error.format(),
      });
    }

    updateJob({
      requestId: req.params.id,
      ...validatedData.data,
    });
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

// GET /jobs?direction=import|export - Return grouped job states
router.get("/jobs", (req: Request, res: Response) => {
  const jobs = req.query.direction
    ? selectJobsByDirection(req.query.direction as "import" | "export")
    : selectAllJobs();

  res.json(jobs);
});

// GET /jobs/:id - Fetch job detail
router.get("/jobs/:id", (req: Request, res: Response) => {
  const job = selectJobById(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

// GET /health - Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default router;
