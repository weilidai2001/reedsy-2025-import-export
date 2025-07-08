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
import { Job } from "./types";

// Define schemas locally to avoid module resolution issues
const TaskRegistryCreateJobSchema = z.object({
  requestId: z.string().uuid(),
  bookId: z.string().uuid(),
  direction: z.enum(["import", "export"]),
  type: z.enum(["epub", "pdf", "word", "wattpad", "evernote"]),
  sourceUrl: z.string().optional(),
});

const TaskRegistryUpdateJobSchema = z.object({
  state: z.enum(["pending", "processing", "finished", "failed"]),
  resultUrl: z.string().optional(),
});

const router = express.Router();

// POST /jobs - Create a new job
router.post("/jobs", (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const validatedData = TaskRegistryCreateJobSchema.safeParse(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        error: "Validation error",
        details: validatedData.error.format(),
      });
    }

    const job: Job = {
      ...validatedData.data,
      state: "pending",
    };

    logger.info("Creating job:", job);

    insertJob(job);

    const createdJob = selectJobById(job.requestId);
    res.status(201).json(createdJob);
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
    res.json(validatedData.data);
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
