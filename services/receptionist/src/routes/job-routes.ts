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
import { config } from "../config";
import logger from "../logger";
import { validate } from "../middleware/validate";

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
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Create job in TaskRegistry
      const taskRegistryRes = await axios.post(
        `${config.taskRegistryUrl}/jobs`,
        {
          ...req.body,
          jobType: "export",
          direction: "export",
        }
      );
      const jobId = (taskRegistryRes.data as { jobId: string }).jobId;

      // Send job to Scheduler
      await axios.post(`${config.schedulerUrl}/queue`, {
        jobId,
        jobType: "export",
        direction: "export",
        type: req.body.type,
      });

      const response: ExportJobResponse = { jobId };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
);

// POST /imports
router.post(
  "/imports",
  validate(importJobSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Create job in TaskRegistry
      const taskRegistryRes = await axios.post(
        `${config.taskRegistryUrl}/jobs`,
        {
          ...req.body,
          jobType: "import",
          direction: "import",
        }
      );
      const jobId = (taskRegistryRes.data as { jobId: string }).jobId;

      // Send job to Scheduler
      await axios.post(`${config.schedulerUrl}/queue`, {
        jobId,
        jobType: "import",
        direction: "import",
        type: req.body.type,
      });

      const response: ImportJobResponse = { jobId };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
);

// GET /exports
router.get(
  "/exports",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskRegistryRes = await axios.get(
        `${config.taskRegistryUrl}/jobs?type=export`
      );
      const jobs = taskRegistryRes.data as JobListResponse;
      res.json(jobs);
    } catch (err) {
      next(err);
    }
  }
);

// GET /imports
router.get(
  "/imports",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taskRegistryRes = await axios.get(
        `${config.taskRegistryUrl}/jobs?type=import`
      );
      const jobs = taskRegistryRes.data as JobListResponse;
      res.json(jobs);
    } catch (err) {
      next(err);
    }
  }
);

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

export default router;
