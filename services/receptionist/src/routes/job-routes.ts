import { Router, Request, Response } from "express";
import axios from "axios";
import { exportJobSchema, importJobSchema } from "../types";
import { validate } from "../middleware/validate";
import logger from "../logger";
import {
  getJobsByDirection,
  registerNewJob,
} from "../clients/task-registry-client";
import { addJobToScheduler } from "../clients/scheduler-client";
import { initialiseJob } from "../transform/jobs-transformer";
import { groupJobsByState } from "../transform/jobs-transformer";

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
    const jobData = initialiseJob(req.body, direction);

    await registerNewJob(jobData);

    logger.info(`${direction} job created in TaskRegistry`, jobData);

    await addJobToScheduler(jobData);

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
    const jobs = await getJobsByDirection("export");
    res.json(groupJobsByState(jobs));
  } catch (err: any) {
    logger.error(`Error fetching exports`, err);
    res.status(500).json({ error: "internal server error" });
  }
});

// GET /imports
router.get("/imports", async (req: Request, res: Response) => {
  try {
    const jobs = await getJobsByDirection("import");
    res.json(groupJobsByState(jobs));
  } catch (err: any) {
    logger.error(`Error fetching imports`, err);
    res.status(500).json({ error: "internal server error" });
  }
});

export default router;
