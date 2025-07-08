import express, { Request, Response } from "express";
import cors from "cors";
import router from "./routes";
import { setupSwagger } from "./swagger";

const app = express();
app.use(cors());
app.use(express.json());

setupSwagger(app);

app.use("/", router);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req: Request, res: Response) => {
  res.send("TaskRegistry Service Running");
});

export default app;
