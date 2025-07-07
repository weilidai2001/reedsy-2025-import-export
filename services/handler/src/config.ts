// Loads configuration and environment variables for Handler Service

import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3003,
  schedulerUrl:
    process.env.SCHEDULER_URL || "http://localhost:3005/api/scheduler",
  taskRegistryUrl:
    process.env.TASK_REGISTRY_URL || "http://localhost:3005/api/task-registry",
  logLevel: process.env.LOG_LEVEL || "info",
  pollingInterval: process.env.POLLING_INTERVAL
    ? parseInt(process.env.POLLING_INTERVAL, 10)
    : 5000,
  maxConcurrentJobs: process.env.MAX_CONCURRENT_JOBS
    ? parseInt(process.env.MAX_CONCURRENT_JOBS, 10)
    : 2,
};
