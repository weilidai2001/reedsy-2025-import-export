import logger from "./logger";
import { getPortFromUrl } from "../../shared/url-util";

import express, { Request, Response } from "express";
import { queueRouter } from "./routes/queue-routes";
import { schedulerStateRouter } from "./queue-service/queue-state";
import { setupSwagger } from "./swagger";

const PORT = getPortFromUrl(process.env.SCHEDULER_URL);

const app = express();
app.use(express.json());

// Set up routes
app.use("/queue", queueRouter);
app.use("/status", schedulerStateRouter);

// Set up Swagger
setupSwagger(app);

// Root endpoint - if not handled by router
app.get("/", (req: Request, res: Response) => {
  res.send("Scheduler Service Running");
});

export function startServer() {
  app.listen(PORT, () => {
    logger.info(`Scheduler service running on ${process.env.SCHEDULER_URL}`);
  });
}

export default app;
