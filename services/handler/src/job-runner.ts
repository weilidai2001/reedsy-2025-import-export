import axios from "axios";
import { Job, JobSchema } from "./types";
import { processJob } from "./job-processor";
import { state } from "./job-state";
import logger from "./logger";
import { z } from "zod";

const POLL_INTERVAL_MS = 5000;
const ERROR_RETRY_INTERVAL_MS = 10000; // Longer retry interval for errors
const SCHEDULER_URL = process.env.SCHEDULER_URL!;
const REGISTRY_URL = process.env.TASK_REGISTRY_URL!;

// Validate that required environment variables are set
function validateEnvironment() {
  const requiredVars = ["SCHEDULER_URL", "TASK_REGISTRY_URL"];
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  logger.info("Environment validated", {
    schedulerUrl: SCHEDULER_URL,
    registryUrl: REGISTRY_URL,
  });
}

export async function startPollingLoop() {
  // Validate environment before starting the polling loop
  try {
    validateEnvironment();
  } catch (err: any) {
    logger.error("Environment validation failed", {
      error: err?.message || String(err),
    });
    throw err; // Stop the polling loop if environment is not properly configured
  }

  logger.info("Starting job polling loop");

  while (true) {
    if (!state.isIdle) {
      await delay(1000);
      continue;
    }

    try {
      let job: Job | undefined;
      try {
        const response = await axios.post(
          `${SCHEDULER_URL}/queue/dequeue`,
          {},
          {
            timeout: 5000,
            validateStatus: (status) => status === 200,
          }
        );
        if (response.status === 204) {
          logger.info("No jobs available for dequeue");
          await delay(POLL_INTERVAL_MS);
          continue;
        } else if (response.status === 200) {
          job = response.data as Job;
        }
      } catch (dequeueErr: any) {
        const status = dequeueErr.response?.status;
        const data = dequeueErr.response?.data;

        logger.error("Failed to dequeue job", {
          error: dequeueErr?.message || String(dequeueErr),
          status,
          data,
          url: `${SCHEDULER_URL}/queue/dequeue`,
        });

        await delay(ERROR_RETRY_INTERVAL_MS);
        continue;
      }

      // Step 3: Validate job schema
      const parsed = JobSchema.safeParse(job);
      if (!parsed.success) {
        logger.error("Invalid job schema", {
          jobId:
            typeof job === "object" && job !== null && "id" in job
              ? job.id
              : "unknown",
          errors: parsed.error.format(),
          job: JSON.stringify(job),
        });
        await delay(POLL_INTERVAL_MS);
        continue;
      }

      // Step 4: Process the job
      await handleJob(parsed.data);
    } catch (err: any) {
      const requestUrl = err.config?.url || "unknown";
      const requestMethod = err.config?.method?.toUpperCase() || "unknown";
      const responseData = err.response?.data || {};
      const status = err.response?.status;

      logger.error("Polling error", {
        service: "Handler",
        error: err?.message || String(err),
        status,
        statusText: err.response?.statusText,
        requestUrl,
        requestMethod,
        responseData,
      });

      await delay(ERROR_RETRY_INTERVAL_MS);
    }
  }
}

async function handleJob(job: Job) {
  state.setIdle(false);
  const start = Date.now();

  logger.info("Starting job", {
    jobId: job.requestId,
    type: job.type,
    direction: job.direction,
    state: "startingProcessing",
  });

  await patchJobState(job.requestId, "processing");

  try {
    await processJob(job);
    const duration = Date.now() - start;
    await patchJobState(job.requestId, "finished");

    state.recordSuccess(job.requestId, duration);
    logger.info("Finished job", {
      jobId: job.requestId,
      type: job.type,
      direction: job.direction,
      state: "finishedProcessing",
    });
  } catch (err: any) {
    const duration = Date.now() - start;
    await patchJobState(job.requestId, "failed");
    state.recordFailure(job.requestId, duration, err);
    logger.error("Failed job", {
      jobId: job.requestId,
      error: err?.message || String(err),
    });
  } finally {
    state.setIdle(true);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function patchJobState(id: string, state: string) {
  try {
    await axios.patch(
      `${REGISTRY_URL}/jobs/${id}`,
      { state },
      {
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 300,
      }
    );
    logger.debug("Updated job state", { jobId: id, state });
  } catch (err: any) {
    const status = err.response?.status;
    const data = err.response?.data;

    logger.error("Failed to update job state", {
      jobId: id,
      state,
      error: err?.message || String(err),
      status,
      data,
    });

    // Re-throw to be handled by the caller
    throw err;
  }
}
