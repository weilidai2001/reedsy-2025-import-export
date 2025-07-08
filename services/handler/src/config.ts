export const config = {
  pollingInterval: process.env.POLLING_INTERVAL
    ? parseInt(process.env.POLLING_INTERVAL, 10)
    : 5000,
};
