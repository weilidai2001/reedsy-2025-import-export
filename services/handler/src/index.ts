import path from "path";
import dotenv from "dotenv";

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import logger from "./logger";
import { createServer } from "./server";
import { startPollingLoop } from "./worker/job-runner";
import { getPortFromUrl } from "../../shared/url-util";

const app = createServer();
const PORT = getPortFromUrl(process.env.HANDLER_URL);
if (!PORT) {
  throw new Error("HANDLER_URL is not defined");
}
app.listen(PORT, () => {
  logger.info(`Handler Service running ${process.env.HANDLER_URL}`);
});

startPollingLoop();
