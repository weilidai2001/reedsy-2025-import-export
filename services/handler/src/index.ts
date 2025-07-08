import path from "path";
import dotenv from "dotenv";

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import logger from "./logger";
import { createServer } from "./server";
import { startPollingLoop } from "./job-runner";
import { getPortFromUrl } from "../../shared/url-util";

const app = createServer();
app.listen(getPortFromUrl(process.env.HANDLER_URL), () => {
  logger.info(`Handler Service running on port ${process.env.HANDLER_PORT}`);
});

startPollingLoop();
