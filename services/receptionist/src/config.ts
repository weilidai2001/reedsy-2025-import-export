import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  taskRegistryUrl:
    process.env.TASK_REGISTRY_URL || "http://localhost:3005/api/task-registry",
  schedulerUrl:
    process.env.SCHEDULER_URL || "http://localhost:3005/api/scheduler",
};
