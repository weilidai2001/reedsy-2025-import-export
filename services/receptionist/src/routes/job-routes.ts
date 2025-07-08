import { Router, Request, Response } from "express";
import axios from "axios";
import {
  ExportJobRequest,
  ImportJobRequest,
  ExportJobResponse,
  ImportJobResponse,
  JobListResponse,
} from "../types";
import {
  Job,
  JobSchema,
  JobSchema as validateJobSchema,
} from "../../../shared/types";
import { validate } from "../middleware/validate";
import logger from "../logger";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const router = Router();

const exportJobSchema = z.object({
  bookId: z.string(),
  type: z.enum(["epub", "pdf"]),
});

const importJobSchema = z.object({
  bookId: z.string(),
  type: z.enum(["word", "pdf", "wattpad", "evernote"]),
  url: z.string().url(),
});

const TaskRegistryCreateJobSchema = z.object({
  requestId: z.string().uuid(),
  bookId: z.string().uuid(),
  direction: z.enum(["import", "export"]),
  type: z.enum(["epub", "pdf", "word", "wattpad", "evernote"]),
  sourceUrl: z.string().optional(),
});

/**
 * Creates a job in the TaskRegistry and queues it in the Scheduler
 * @param direction The direction of the job (import or export)
 */
const createJob = async (
  req: Request,
  res: Response,
  direction: "import" | "export"
) => {
  logger.info(`Received ${direction} job request`, { body: req.body });
  try {
    // Prepare job data based on direction
    let jobData: any;

    if (direction === "export") {
      jobData = {
        requestId: uuidv4(),
        bookId: req.body.bookId,
        direction: "export",
        type: req.body.type,
        sourceUrl: undefined,
      };
    } else {
      // import
      jobData = {
        ...req.body,
        direction: "import",
      };
    }

    // Validate job data for TaskRegistry
    const parsed = TaskRegistryCreateJobSchema.safeParse(jobData);
    if (!parsed.success) {
      logger.error("Invalid job schema", {
        errors: parsed.error.format(),
        job: JSON.stringify(jobData),
      });
      res.status(400).json({ error: parsed.error.format() });
      return;
    }

    logger.info(`Validated ${direction} job data`, parsed.data);

    // Create job in TaskRegistry
    const taskRegistryRes = await axios.post(
      `${process.env.TASK_REGISTRY_URL}/jobs`,
      parsed.data
    );

    logger.info(
      `${
        direction.charAt(0).toUpperCase() + direction.slice(1)
      } job created in TaskRegistry`,
      taskRegistryRes.data
    );

    // Validate TaskRegistry response
    const parsedTaskRegistryRes = JobSchema.safeParse(taskRegistryRes.data);
    if (!parsedTaskRegistryRes.success) {
      logger.error("Invalid job schema from TaskRegistry", {
        errors: parsedTaskRegistryRes.error.format(),
        job: JSON.stringify(taskRegistryRes.data),
      });
      res.status(400).json({ error: parsedTaskRegistryRes.error.format() });
      return;
    }

    logger.info(
      `${
        direction.charAt(0).toUpperCase() + direction.slice(1)
      } job created in TaskRegistry`,
      parsedTaskRegistryRes.data
    );

    // Send job to Scheduler
    await axios.post(
      `${process.env.SCHEDULER_URL}/queue`,
      parsedTaskRegistryRes.data
    );

    // Return response based on job type
    const response = {
      jobId: parsedTaskRegistryRes.data.requestId,
    };
    res.status(201).json(response);
  } catch (err: any) {
    logger.error(`Error creating ${direction} job`, err);
    res.status(500).json({ error: err.message });
  }
};

// POST /exports
router.post(
  "/exports",
  validate(exportJobSchema),
  async (req: Request, res: Response) => {
    await createJob(req, res, "export");
  }
);

// POST /imports
router.post(
  "/imports",
  validate(importJobSchema),
  async (req: Request, res: Response) => {
    await createJob(req, res, "import");
  }
);

// GET /exports
router.get("/exports", async (req: Request, res: Response) => {
  try {
    const taskRegistryRes = await axios.get(
      `${process.env.TASK_REGISTRY_URL}/jobs?type=export`
    );
    const jobs = taskRegistryRes.data as JobListResponse;
    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /imports
router.get("/imports", async (req: Request, res: Response) => {
  try {
    const taskRegistryRes = await axios.get(
      `${process.env.TASK_REGISTRY_URL}/jobs?type=import`
    );
    const jobs = taskRegistryRes.data as JobListResponse;
    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

export default router;
