import express from "express";
import { state } from "./worker/job-state";

export function createServer() {
  const app = express();

  app.get("/status", (_req, res) => {
    res.json({
      jobsProcessed: state.jobsProcessed,
      jobsSucceeded: state.jobsSucceeded,
      jobsFailed: state.jobsFailed,
      currentJob: state.currentJob,
      lastJobDurationMs: state.lastJobDurationMs,
      lastJobError: state.lastJobError,
      isIdle: state.isIdle,
      lastJobSuccess: state.lastJobSuccess,
    });
  });

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  return app;
}
