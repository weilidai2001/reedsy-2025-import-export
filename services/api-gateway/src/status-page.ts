import express, { Request, Response } from "express";
import axios from "axios";
import logger from "./logger";
import { config } from "./config";

const statusRouter = express.Router();

// List of services to check
const services = [
  {
    name: "Scheduler",
    key: "scheduler",
    url: "/api/scheduler",
    healthEndpoint: "/health",
  },
  {
    name: "Task Registry",
    key: "task-registry",
    url: "/api/task-registry",
    healthEndpoint: "/health",
  },
  {
    name: "Handler",
    key: "handler",
    url: "/api/handler",
    healthEndpoint: "/health",
  },
  {
    name: "Receptionist",
    key: "receptionist",
    url: "/api/receptionist",
    healthEndpoint: "/health",
  },
  {
    name: "API Gateway",
    key: "api-gateway",
    url: "",
    healthEndpoint: "/health",
  },
];

statusRouter.get("/status", async (req: Request, res: Response) => {
  const results: Record<string, boolean> = {};
  await Promise.all(
    services.map(async (svc) => {
      try {
        if (svc.key === "api-gateway") {
          // Direct internal call for self
          results[svc.key] = true;
        } else {
          // Use proxied URL via current API Gateway instance
          const baseUrl = `http://localhost:${config.port}`;
          const resp = await axios.get(
            `${baseUrl}${svc.url}${svc.healthEndpoint}`,
            { timeout: 2000 }
          );
          results[svc.key] = resp.status === 200;
        }
      } catch {
        results[svc.key] = false;
      }
    })
  );
  res.json({
    services: services.map((svc) => ({ name: svc.name, key: svc.key })),
    status: results,
  });
});

export default statusRouter;
