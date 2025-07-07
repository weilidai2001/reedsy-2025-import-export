// src/config.ts

export const config = {
  taskRegistryUrl: process.env.TASK_REGISTRY_URL || 'http://localhost:3001',
  schedulerUrl: process.env.SCHEDULER_URL || 'http://localhost:3002',
};
