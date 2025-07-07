import app from "./app";
import logger from "./logger";
import { getPortFromUrl } from "../../shared/url-util";

const PORT = getPortFromUrl(process.env.SCHEDULER_URL);
app.listen(PORT, () => {
  logger.info(`Scheduler service listening on port ${PORT}`);
});
