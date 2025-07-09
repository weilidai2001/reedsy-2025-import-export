import { Router, Request, Response } from "express";
import axios from "axios";
import { Job, JobSchema, exportJobSchema, importJobSchema } from "../types";
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

    const taskRegistryRes = await axios.post(
      `${process.env.TASK_REGISTRY_URL}/jobs`,
      jobData
    );

    if (taskRegistryRes.status !== 201) {
      throw new Error(
        `Failed to create job in TaskRegistry. Status: ${taskRegistryRes.status}`
      );
    }

    logger.info(`${direction} job created in TaskRegistry`, jobData);

    // Send job to Scheduler
    const schedulerRes = await axios.post(`${process.env.SCHEDULER_URL}/queue`, jobData);
    if (schedulerRes.status !== 201) {
      throw new Error(
        `Failed to queue job in Scheduler. Status: ${schedulerRes.status}`
      );
    }

    res.status(201).json({
      jobId: jobData.requestId,
    });
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

export default router;
