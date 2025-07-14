import express, { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { getPortFromUrl } from "@reedsy/shared";

const app = express();
const port = getPortFromUrl(process.env.API_GATEWAY_URL);

// Downstream services (mimic multiple instances)
const targets: string[] = [
  process.env.RECEPTIONIST_SERVICE_URL!,
  process.env.RECEPTIONIST_SERVICE_URL!,
  process.env.RECEPTIONIST_SERVICE_URL!,
];

let currentIndex = 0;

// Round-robin target selector
const getNextTarget = (): string => {
  const target = targets[currentIndex];
  currentIndex = (currentIndex + 1) % targets.length;
  return target;
};

// High rate limit (e.g., 10000 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
});

// Extend Request type to attach _proxyTarget
interface ProxiedRequest extends Request {
  _proxyTarget?: string;
}

// Middleware to dynamically route requests
const dynamicProxy = (
  req: ProxiedRequest,
  res: Response,
  next: NextFunction
): void => {
  const target = getNextTarget();

  const proxyOptions: Options = {
    target,
    changeOrigin: true,
    proxyTimeout: 5000,
    pathRewrite: (path) => path,
    onProxyReq: (proxyReq, req) => {
      (req as ProxiedRequest)._proxyTarget = target;
    },
    onError: (err, req, res) => {
      const response = res as Response;
      response.status(502).json({ error: "Bad Gateway", detail: err.message });
    },
  };

  createProxyMiddleware(proxyOptions)(req, res, next);
};

app.use(limiter);

// Homepage endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the API Gateway!");
});

// Status OK endpoint
app.get("/status", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("*", dynamicProxy);

app.listen(port, () => {
  console.log(`API Gateway running at ${process.env.API_GATEWAY_URL}`);
});
