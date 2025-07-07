import winston from "winston";
import url from "url";

const loggingServiceUrl = process.env.LOGGING_SERVICE_URL;
if (!loggingServiceUrl) {
  throw new Error("LOGGING_SERVICE_URL is not defined");
}

const parsedUrl = url.parse(loggingServiceUrl);
const loggingHost = parsedUrl.hostname || "localhost";

if (!parsedUrl.port) {
  throw new Error("LOGGING_SERVICE_URL port is not defined");
}
const loggingPort = parseInt(parsedUrl.port, 10);

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
