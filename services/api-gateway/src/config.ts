// Loads configuration and environment variables for API Gateway
import dotenv from "dotenv";
dotenv.config();

// Changed default port from 3000 to 3005 to avoid conflict with other services.
export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3005,
  schedulerUrl: process.env.SCHEDULER_URL || "http://localhost:3002",
  taskRegistryUrl: process.env.TASK_REGISTRY_URL || "http://localhost:3004",
  logLevel: process.env.LOG_LEVEL || "info",
};
