import express from "express";
import logger from "./logger";
import { config } from "./config";
import { createProxyMiddleware } from "http-proxy-middleware";
import { Request, Response } from "express";

const app = express();
app.use(express.json());

// Status page router
import statusRouter from "./status-page";
import statusFrontendRouter from "./status-page-frontend";
import path from "path";
app.use("/status-page", statusRouter);
app.use("/status-page-ui", statusFrontendRouter);
app.use("/status-page-ui/static", express.static(path.join(__dirname, "./")));

// Proxy /api/scheduler/* to Scheduler service
app.use(
  "/api/scheduler",
  createProxyMiddleware({
    target: config.schedulerUrl,
    changeOrigin: true,
    pathRewrite: { "^/api/scheduler": "" },
    onProxyReq: (
      proxyReq: import("http").ClientRequest,
      req: Request,
      res: Response
    ) => {
      logger.info(
        `[Proxy] ${req.method} ${req.originalUrl} -> ${config.schedulerUrl}${req.url}`
      );
    },
    onError: (err: Error, req: Request, res: Response) => {
      logger.error(`[ProxyError] Scheduler: ${err.message}`);
      res.status(502).send("Bad Gateway");
    },
  })
);

// Proxy /api/task-registry/* to Task Registry service
app.use(
  "/api/task-registry",
  createProxyMiddleware({
    target: config.taskRegistryUrl,
    changeOrigin: true,
    pathRewrite: { "^/api/task-registry": "" },
    onProxyReq: (
      proxyReq: import("http").ClientRequest,
      req: Request,
      res: Response
    ) => {
      logger.info(
        `[Proxy] ${req.method} ${req.originalUrl} -> ${config.taskRegistryUrl}${req.url}`
      );
    },
    onError: (err: Error, req: Request, res: Response) => {
      logger.error(`[ProxyError] TaskRegistry: ${err.message}`);
      res.status(502).send("Bad Gateway");
    },
  })
);

// Proxy /api/handler/* to Handler service
app.use(
  "/api/handler",
  createProxyMiddleware({
    target: config.handlerUrl,
    changeOrigin: true,
    pathRewrite: { "^/api/handler": "" },
    onProxyReq: (
      proxyReq: import("http").ClientRequest,
      req: Request,
      res: Response
    ) => {
      logger.info(
        `[Proxy] ${req.method} ${req.originalUrl} -> ${config.handlerUrl}${req.url}`
      );
    },
    onError: (err: Error, req: Request, res: Response) => {
      logger.error(`[ProxyError] Handler: ${err.message}`);
      res.status(502).send("Bad Gateway");
    },
  })
);

// Proxy /api/receptionist/* to Receptionist service
app.use(
  "/api/receptionist",
  createProxyMiddleware({
    target: config.receptionistUrl,
    changeOrigin: true,
    pathRewrite: { "^/api/receptionist": "" },
    onProxyReq: (
      proxyReq: import("http").ClientRequest,
      req: Request,
      res: Response
    ) => {
      logger.info(
        `[Proxy] ${req.method} ${req.originalUrl} -> ${config.receptionistUrl}${req.url}`
      );
    },
    onError: (err: Error, req: Request, res: Response) => {
      logger.error(`[ProxyError] Receptionist: ${err.message}`);
      res.status(502).send("Bad Gateway");
    },
  })
);

app.get("/", (req: Request, res: Response) => {
  logger.info("Root endpoint accessed");
  res.send("API Gateway Running");
});

app.get("/health", (req: Request, res: Response) => {
  logger.info("Health check endpoint accessed");
  res.status(200).json({ status: "ok", service: "api-gateway" });
});

export default app;
