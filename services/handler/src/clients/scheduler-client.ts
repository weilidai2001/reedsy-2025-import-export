import axios from "axios";
import { Job } from "../types";
import logger from "../logger";

export const dequeue = async () => {
  try {
    const response = await axios.post(
      `${process.env.SCHEDULER_URL}/queue/dequeue`,
      {},
      {
        timeout: 5000,
        validateStatus: (status) => status === 200 || status === 204,
      }
    );
    if (response.status === 204) {
      return Promise.resolve(undefined);
    } else if (response.status === 200) {
      const job = response.data as Job;
      return Promise.resolve(job);
    }
  } catch (dequeueErr: any) {
    const status = dequeueErr.response?.status;
    const data = dequeueErr.response?.data;

    logger.error("Failed to dequeue job", {
      error: dequeueErr?.message || String(dequeueErr),
      status,
      data,
      url: `${process.env.SCHEDULER_URL}/queue/dequeue`,
    });
    return Promise.resolve(undefined);
  }
};
