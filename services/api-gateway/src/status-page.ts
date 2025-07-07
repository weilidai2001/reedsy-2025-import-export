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
    url: config.schedulerUrl,
    healthEndpoint: "/health",
  },
  {
    name: "Task Registry",
    key: "task-registry",
    url: config.taskRegistryUrl,
    healthEndpoint: "/health",
  },
];

// Helper to get last N days (including today)
function getLastNDates(n: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates.reverse();
}

statusRouter.get("/status", async (req: Request, res: Response) => {
  const results: Record<string, boolean> = {};
  await Promise.all(
    services.map(async (svc) => {
      try {
        const resp = await axios.get(`${svc.url}${svc.healthEndpoint}`, { timeout: 2000 });
        results[svc.key] = resp.status === 200;
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
