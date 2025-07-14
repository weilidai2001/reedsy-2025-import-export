import app from "./app";
import logger from "./logger";
import { getPortFromUrl } from "@reedsy/shared";

const PORT = getPortFromUrl(process.env.TASK_REGISTRY_URL);
app.listen(PORT, () => {
  logger.info(
    `TaskRegistry service running on ${process.env.TASK_REGISTRY_URL}`
  );
});
