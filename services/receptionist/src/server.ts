import { getPortFromUrl } from "@reedsy/shared";
import app from "./app";
import logger from "./logger";

if (!process.env.RECEPTIONIST_SERVICE_URL) {
  throw new Error("RECEPTIONIST_SERVICE_URL is not defined");
}

const PORT = getPortFromUrl(process.env.RECEPTIONIST_SERVICE_URL);
logger.info(`Attempting to start Receptionist service on port ${PORT}`);

try {
  app.listen(PORT, () => {
    logger.info(
      `Receptionist service running ${process.env.RECEPTIONIST_SERVICE_URL}`
    );
  });
} catch (err) {
  logger.error("Error starting server", { err });
  process.exit(1);
}
