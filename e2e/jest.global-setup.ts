import { spawn } from "child_process";
import path from "path";
import axios from "axios";
import { loadRootEnv } from "../services/shared/load-env";

loadRootEnv();

const services = [
  {
    name: "receptionist",
    healthCheckUrl: `${process.env.RECEPTIONIST_SERVICE_URL}/health`,
  },
  {
    name: "scheduler",
    healthCheckUrl: `${process.env.SCHEDULER_URL}/health`,
  },
  {
    name: "task-registry",
    healthCheckUrl: `${process.env.TASK_REGISTRY_URL}/health`,
  },
  {
    name: "handler",
    healthCheckUrl: `${process.env.HANDLER_URL}/health`,
  },
  {
    name: "api-gateway",
    healthCheckUrl: `${process.env.API_GATEWAY_URL}/health`,
  },
];

const waitForService = async (
  url: string,
  serviceName: string
): Promise<void> => {
  const timeout = 60000; // 60 seconds
  const interval = 2000; // 2 seconds
  const startTime = Date.now();

  console.log(`Waiting for ${serviceName} at ${url}...`);

  while (Date.now() - startTime < timeout) {
    try {
      await axios.get(url);
      console.log(`${serviceName} is healthy.`);
      return;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  throw new Error(
    `${serviceName} did not become healthy in ${timeout / 1000}s`
  );
};

export default async () => {
  console.log("\nStarting all services...");

  const servicesProcess = spawn("npm", ["run", "dev"], {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
    detached: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).__E2E_PROCESSES__ = [servicesProcess];

  console.log("Waiting for services to become healthy...");

  const healthCheckPromises = services.map((service) =>
    waitForService(service.healthCheckUrl, service.name)
  );

  try {
    await Promise.all(healthCheckPromises);
    console.log("All services are up and running.");
  } catch (error) {
    console.error("Failed to start services:", error);
    if (servicesProcess.pid) {
      const { default: teardown } = await import("./jest.global-teardown");
      await teardown();
    }
    process.exit(1);
  }
};
