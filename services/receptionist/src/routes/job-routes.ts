import { Router, Request, Response, NextFunction } from "express";
import Joi from "joi";
import axios from "axios";
import {
  ExportJobRequest,
  ImportJobRequest,
  ExportJobResponse,
  ImportJobResponse,
  JobListResponse,
} from "../types";
import { Job, JobSchema as validateJobSchema } from "../../../shared/types";
import { validate } from "../middleware/validate";
import logger from "../logger";

const router = Router();

const exportJobSchema = Joi.object<ExportJobRequest>({
  bookId: Joi.string().required(),
  type: Joi.string().valid("epub", "pdf").required(),
});

const importJobSchema = Joi.object<ImportJobRequest>({
  bookId: Joi.string().required(),
  type: Joi.string().valid("word", "pdf", "wattpad", "evernote").required(),
  url: Joi.string().uri().required(),
});

// POST /exports
router.post(
  "/exports",
  validate(exportJobSchema),
  async (req: Request, res: Response) => {
    logger.info("Received job enqueue request", { body: req.body });
    try {
      // Create job in TaskRegistry
      const taskRegistryRes = await axios.post(
        `${process.env.TASK_REGISTRY_URL}/jobs`,
        {
          ...req.body,
          jobType: "export",
          direction: "export",
        }
      );

      logger.info("Job created in TaskRegistry", taskRegistryRes.data);

      // validate taskRegistryRes.data is a type of Job
      const parsed = validateJobSchema.safeParse(taskRegistryRes.data);
      if (!parsed.success) {
        logger.error("Invalid job schema", {
          jobId:
            typeof taskRegistryRes.data === "object" &&
            taskRegistryRes.data !== null &&
            "id" in taskRegistryRes.data
              ? taskRegistryRes.data.id
              : "unknown",
          errors: parsed.error.format(),
          job: JSON.stringify(taskRegistryRes.data),
        });
        logger.error(parsed.error.format());
        res.status(400).json({ error: parsed.error.format() });
        return; // Add return statement to prevent further execution
      }

      // Ensure parsed.data exists before proceeding
      if (!parsed.data) {
        logger.error("Parsed data is undefined");
        res
          .status(500)
          .json({ error: "Internal server error processing job data" });
        return;
      }

      logger.info("Enqueuing job", parsed.data);

      // Send job to Scheduler
      await axios.post(`${process.env.SCHEDULER_URL}/queue`, parsed.data);

      const response: ExportJobResponse = { jobId: parsed.data.id };
      res.status(201).json(response);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /imports
router.post(
  "/imports",
  validate(importJobSchema),
  async (req: Request, res: Response) => {
    try {
      // Create job in TaskRegistry
      const taskRegistryRes = await axios.post(
        `${process.env.TASK_REGISTRY_URL}/jobs`,
        {
          ...req.body,
          jobType: "import",
          direction: "import",
        }
      );

      // validate taskRegistryRes.data is a type of Job
      const parsed = validateJobSchema.safeParse(taskRegistryRes.data);
      if (!parsed.success) {
        logger.error("Invalid job schema", {
          jobId:
            typeof taskRegistryRes.data === "object" &&
            taskRegistryRes.data !== null &&
            "id" in taskRegistryRes.data
              ? taskRegistryRes.data.id
              : "unknown",
          errors: parsed.error.format(),
          job: JSON.stringify(taskRegistryRes.data),
        });
        logger.error(parsed.error.format());
        res.status(400).json({ error: parsed.error.format() });
        return; // Add return statement to prevent further execution
      }

      // Ensure parsed.data exists before proceeding
      if (!parsed.data) {
        logger.error("Parsed data is undefined");
        res
          .status(500)
          .json({ error: "Internal server error processing job data" });
        return;
      }

      const payloadToScheduler: Job = parsed.data;

      const response: ImportJobResponse = { jobId: payloadToScheduler.id };
      res.status(201).json(response);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
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
