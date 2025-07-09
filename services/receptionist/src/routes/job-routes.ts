import { Router, Request, Response } from "express";
import axios from "axios";
import {
  Job,
  TaskRegistryCreateJobSchema,
  JobSchema,
  exportJobSchema,
  importJobSchema,
} from "../types";
import { validate } from "../middleware/validate";
import logger from "../logger";
import { v4 as uuidv4 } from "uuid";

const router = Router();

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
    const now = new Date().toISOString();
    // Prepare job data based on direction
    const jobData: Job = {
      requestId: uuidv4(),
      bookId: req.body.bookId,
      direction,
      type: req.body.type,
      state: "pending",
      sourceUrl: direction === "import" ? req.body.url : undefined,
      createdAt: now,
      updatedAt: now,
    };

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
      `${direction} job created in TaskRegistry`,
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
      `${direction} job created in TaskRegistry`,
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
    res.status(500).json({ error: "internal server error" });
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
      `${process.env.TASK_REGISTRY_URL}/jobs?direction=export`
    );
    const jobs = taskRegistryRes.data;
    res.json(jobs);
  } catch (err: any) {
    logger.error(`Error fetching exports`, err);
    res.status(500).json({ error: "internal server error" });
  }
});

// GET /imports
router.get("/imports", async (req: Request, res: Response) => {
  try {
    const taskRegistryRes = await axios.get(
      `${process.env.TASK_REGISTRY_URL}/jobs?direction=import`
    );
    const jobs = taskRegistryRes.data;
    res.json(jobs);
  } catch (err: any) {
    logger.error(`Error fetching imports`, err);
    res.status(500).json({ error: "internal server error" });
  }
});

// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

export default router;
