import express from "express";
import logger from "./logger";
import jobRoutes from "./routes/job-routes";
import { errorHandler } from "./middleware/error-handler";
import { setupSwagger } from "./swagger";

const app = express();
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info("Incoming request", {
    method: req.method,
    url: req.url,
    body: JSON.stringify(req.body),
  });
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "receptionist" });
});

// Job endpoints
app.use(jobRoutes);

// Swagger UI
setupSwagger(app);

// Error handler
app.use(errorHandler);

export default app;
