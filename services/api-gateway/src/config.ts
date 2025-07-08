// Loads configuration and environment variables for API Gateway
import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  schedulerUrl: process.env.SCHEDULER_URL || "http://localhost:3002",
  taskRegistryUrl: process.env.TASK_REGISTRY_URL || "http://localhost:3004",
  handlerUrl: process.env.HANDLER_URL || "http://localhost:3003",
  receptionistUrl: process.env.RECEPTIONIST_URL || "http://localhost:3001",
  logLevel: process.env.LOG_LEVEL || "info",
};
