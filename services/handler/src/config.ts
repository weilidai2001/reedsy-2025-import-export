import { loadRootEnv } from "@reedsy/shared";

// Load environment variables from root .env file
loadRootEnv();

export const config = {
  port: process.env.HANDLER_PORT ? parseInt(process.env.HANDLER_PORT, 10) : 3001,
  pollingInterval: process.env.POLLING_INTERVAL
    ? parseInt(process.env.POLLING_INTERVAL, 10)
    : 5000, // Default 5 seconds in milliseconds
  schedulerUrl: process.env.SCHEDULER_URL || 'http://localhost:3002',
  taskRegistryUrl: process.env.TASK_REGISTRY_URL || 'http://localhost:3003',
  // Processing times in milliseconds
  processingTimes: {
    export: {
      epub: 10000, // 10 seconds
      pdf: 25000,  // 25 seconds
    },
    import: {
      epub: 60000,    // 60 seconds
      pdf: 60000,     // 60 seconds
      word: 60000,    // 60 seconds
      wattpad: 60000, // 60 seconds
      evernote: 60000 // 60 seconds
    }
  }
};
