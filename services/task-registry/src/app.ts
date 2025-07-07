import express from "express";
import cors from "cors";
import router from "./routes";
import { initializeJobsTable } from "./models";
import { setupSwagger } from "./swagger";

const app = express();
app.use(cors());
app.use(express.json());

initializeJobsTable();
setupSwagger(app);

app.use("/", router);

import { Request, Response } from "express";

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req: Request, res: Response) => {
  res.send("TaskRegistry Service Running");
});

export default app;
