import winston from "winston";
import url from "url";

const createLogger = (serviceName: string) => {
  const loggingServiceUrl = process.env.LOGGING_SERVICE_URL;
  if (!loggingServiceUrl) {
    throw new Error("LOGGING_SERVICE_URL is not defined");
  }

  const parsedUrl = url.parse(loggingServiceUrl);
  const loggingHost = parsedUrl.hostname;

  if (!loggingHost) {
    throw new Error("LOGGING_SERVICE_URL host is not defined");
  }

  if (!parsedUrl.port) {
    throw new Error("LOGGING_SERVICE_URL port is not defined");
  }
  const loggingPort = parseInt(parsedUrl.port, 10);

  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ""
      }`;
    })
  );

  const httpFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ""
      }`;
    })
  );

  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.Http({
        host: loggingHost,
        port: loggingPort,
        path: "/logs",
        ssl: parsedUrl.protocol === "https:",
        format: httpFormat,
      }),
      new winston.transports.Console({
        format: consoleFormat,
      }),
    ],
  });

  return logger;
};

export default createLogger;
