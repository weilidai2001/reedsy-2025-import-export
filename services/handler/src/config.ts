export const config = {
  logLevel: process.env.LOG_LEVEL || "info",
  pollingInterval: process.env.POLLING_INTERVAL
    ? parseInt(process.env.POLLING_INTERVAL, 10)
    : 5000,
  maxConcurrentJobs: process.env.MAX_CONCURRENT_JOBS
    ? parseInt(process.env.MAX_CONCURRENT_JOBS, 10)
    : 2,
};
