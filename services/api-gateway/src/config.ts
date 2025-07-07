// Loads configuration and environment variables for API Gateway
import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  schedulerUrl: process.env.SCHEDULER_URL || "http://localhost:3002",
  taskRegistryUrl: process.env.TASK_REGISTRY_URL || "http://localhost:3004",
  logLevel: process.env.LOG_LEVEL || "info",
};
