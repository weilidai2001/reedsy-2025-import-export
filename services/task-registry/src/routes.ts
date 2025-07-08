import express, { Request, Response } from "express";
import { createJob, updateJob, getJobById, listJobs } from "./models";
import { z, ZodError } from "zod";
import logger from "./logger";

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

    const now = new Date().toISOString();
    const job = {
      ...validatedData.data,
      createdAt: now,
      updatedAt: now,
      state: "pending",
    };

    logger.info("Creating job:", job);
    createJob(job, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json(job);
    });
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

    updateJob(req.params.id, validatedData.data, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      getJobById(req.params.id, (err, job) => {
        if (err || !job)
          return res.status(404).json({ error: "Job not found" });
        res.json(job);
      });
    });
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
  listJobs(req.query.direction as string, (err, jobs) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(jobs);
  });
});

// GET /jobs/:id - Fetch job detail
router.get("/jobs/:id", (req: Request, res: Response) => {
  getJobById(req.params.id, (err, job) => {
    if (err || !job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  });
});

// GET /health - Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

export default router;
