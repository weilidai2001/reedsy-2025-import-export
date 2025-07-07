import winston from "winston";
import url from "url";
import { loadRootEnv } from "@reedsy/shared/load-env";

// Load environment variables from project root
loadRootEnv();

const loggingServiceUrl =
  process.env.LOGGING_SERVICE_URL || "http://localhost:4000";
const parsedUrl = url.parse(loggingServiceUrl);
const loggingHost = parsedUrl.hostname || "localhost";
const loggingPort = parsedUrl.port ? parseInt(parsedUrl.port, 10) : 4000;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ""
      }`;
    })
  ),
  transports: [
    new winston.transports.Http({
      host: loggingHost,
      port: loggingPort,
      path: "/logs",
      ssl: parsedUrl.protocol === "https:",
    }),
    new winston.transports.Console(),
  ],
});

export default logger;
