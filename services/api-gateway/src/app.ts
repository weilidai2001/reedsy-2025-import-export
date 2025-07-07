import express, { Request, Response } from "express";
import logger from "./logger";
import { config } from "./config";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
// Status page router
import statusRouter from "./status-page";
import statusFrontendRouter from "./status-page-frontend";
import path from "path";

// Only use express.json() for status-page and related endpoints
app.use("/status-page", express.json(), statusRouter);
app.use("/status-page-ui", express.json(), statusFrontendRouter);
app.use("/status-page-ui/static", express.static(path.join(__dirname, "./")));

// Parse JSON bodies for all /api routes
app.use("/api", express.json());

// Log body for all /api requests (before proxy)
app.use("/api", (req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    logger.info(
      `[RequestBody] ${req.method} ${req.originalUrl} | body: ${JSON.stringify(
        req.body
      )}`
    );
  }
  next();
});

// DRY proxy setup
interface ProxyConfig {
  route: string;
  target: string;
  serviceName: string;
  pathRewrite: { [key: string]: string };
}

const proxyConfigs: ProxyConfig[] = [
  {
    route: "/api/scheduler",
    target: config.schedulerUrl,
    serviceName: "Scheduler",
    pathRewrite: { "^/api/scheduler": "" },
  },
  {
    route: "/api/task-registry",
    target: config.taskRegistryUrl,
    serviceName: "TaskRegistry",
    pathRewrite: { "^/api/task-registry": "" },
  },
  {
    route: "/api/handler",
    target: config.handlerUrl,
    serviceName: "Handler",
    pathRewrite: { "^/api/handler": "" },
  },
  {
    route: "/api/receptionist",
    target: config.receptionistUrl,
    serviceName: "Receptionist",
    pathRewrite: { "^/api/receptionist": "" },
  },
];

proxyConfigs.forEach(({ route, target, serviceName, pathRewrite }) => {
  app.use(
    route,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite,
      onProxyReq: (
        proxyReq: import("http").ClientRequest,
        req: Request,
        res: Response
      ) => {
        // Forward body for POST/PUT requests
        if (
          (req.method === "POST" || req.method === "PUT") &&
          req.body &&
          Object.keys(req.body).length > 0
        ) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader("Content-Type", "application/json");
          proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
        const bodyLog =
          req.body && Object.keys(req.body).length > 0
            ? ` | body: ${JSON.stringify(req.body)}`
            : "";
        logger.info(
          `[Proxy] ${req.method} ${req.originalUrl} -> ${target}${req.url}${bodyLog}`
        );
      },
      onError: (err: Error, req: Request, res: Response) => {
        logger.error(`[ProxyError] ${serviceName}: ${err.message}`);
        res.status(502).send("Bad Gateway");
      },
    })
  );
});

app.get("/", (req: Request, res: Response) => {
  logger.info("Root endpoint accessed");
  res.send("API Gateway Running");
});

app.get("/health", (req: Request, res: Response) => {
  logger.info("Health check endpoint accessed");
  res.status(200).json({ status: "ok", service: "api-gateway" });
});

export default app;
