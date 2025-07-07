import { getPortFromUrl } from "../../shared/url-util";
import app from "./app";
import logger from "./logger";

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", { err });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", { reason });
  process.exit(1);
});

if (!process.env.RECEPTIONIST_SERVICE_URL) {
  throw new Error("RECEPTIONIST_SERVICE_URL is not defined");
}

const PORT = getPortFromUrl(process.env.RECEPTIONIST_SERVICE_URL);
logger.info(`Attempting to start Receptionist service on port ${PORT}`);

try {
  app.listen(PORT, () => {
    logger.info(`Receptionist service listening on port ${PORT}`);
  });
} catch (err) {
  logger.error("Error starting server", { err });
  process.exit(1);
}
