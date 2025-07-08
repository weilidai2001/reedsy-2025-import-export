import * as express from "express";
import { enqueueJob, dequeueJob, getAllJobs } from "./queue-manager";
import { Job } from "../../shared/types";

const router = express.Router();

// Enqueue a job
router.post("/queue", ((req: express.Request, res: express.Response) => {
  const job: Job = req.body;
  const validDirections = ["import", "export"];
  const validTypes = ["epub", "pdf", "word", "wattpad", "evernote"];
  if (
    !job.direction ||
    !job.type ||
    !validDirections.includes(job.direction) ||
    !validTypes.includes(job.type)
  ) {
    return res
      .status(400)
      .json({ error: "Valid direction and type are required" });
  }
  enqueueJob({
    ...job,
    direction: job.direction as "import" | "export",
    type: job.type as "epub" | "pdf" | "word" | "wattpad" | "evernote",
  });
  res.status(201).json({ message: "Job enqueued", job });
}) as express.RequestHandler);

// Dequeue a job
router.post("/queue/dequeue", ((
  req: express.Request,
  res: express.Response
) => {
  // With the simplified queue, we don't need to specify direction and type for dequeue
  const job = dequeueJob();
  if (!job) {
    return res.status(404).json({ error: "No job available" });
  }
  res.json(job);
}) as express.RequestHandler);

// List all jobs in the queue
router.get("/queue", ((req: express.Request, res: express.Response) => {
  res.json(getAllJobs());
}) as express.RequestHandler);

// Health check endpoint
router.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({ status: "ok" });
});

export default router;
