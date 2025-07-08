import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import logger from "./logger";

process.on("SIGINT", () => {
  logger.info("Gracefully stopping job polling...");
  process.exit(0);
});

import "./server";
