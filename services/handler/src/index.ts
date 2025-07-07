import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import { JobAcquisitionManager } from "./job-acquisition";
import { TaskRegistryClient } from "./task-registry-client";
import logger from "./logger";

const taskRegistryClient = new TaskRegistryClient();
const jobAcquisitionManager = new JobAcquisitionManager(taskRegistryClient);
jobAcquisitionManager.startPolling();

process.on("SIGINT", () => {
  logger.info("Gracefully stopping job polling...");
  jobAcquisitionManager.stopPolling();
  process.exit(0);
});
