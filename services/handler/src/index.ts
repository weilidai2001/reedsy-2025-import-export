import { loadRootEnv } from "@reedsy/shared";

// Load environment variables from root .env file
loadRootEnv();

import logger from "./logger";
import { createServer } from "./server";
import { startPollingLoop } from "./worker/job-runner";
import { getPortFromUrl } from "@reedsy/shared";

const app = createServer();
const PORT = getPortFromUrl(process.env.HANDLER_URL);
if (!PORT) {
  throw new Error("HANDLER_URL is not defined");
}
app.listen(PORT, () => {
  logger.info(`Handler Service running ${process.env.HANDLER_URL}`);
});

startPollingLoop();
