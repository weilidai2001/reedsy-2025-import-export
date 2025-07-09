import axios from "axios";
import logger from "../logger";

export const updateRegistry = async (jobId: string, state: string) => {
  try {
    await axios.patch(
      `${process.env.TASK_REGISTRY_URL}/jobs/${jobId}`,
      { state },
      {
        timeout: 5000,
        validateStatus: (status) => status === 204,
      }
    );
    logger.debug("Updated job state", { jobId, state });
  } catch (err: any) {
    const status = err.response?.status;
    const data = err.response?.data;

    logger.error("Failed to update job state", {
      jobId,
      state,
      error: err?.message || String(err),
      status,
      data,
    });

    // Re-throw to be handled by the caller
    throw err;
  }
};
