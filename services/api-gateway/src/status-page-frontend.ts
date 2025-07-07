import express, { Request, Response } from "express";
import path from "path";

const statusFrontendRouter = express.Router();

statusFrontendRouter.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "status-page.html"));
});

export default statusFrontendRouter;
