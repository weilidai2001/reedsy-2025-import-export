import axios from "axios";
import type { Job } from "../types";

export const registerNewJob = async (jobData: Job) => {
  const res = await axios.post(
    `${process.env.TASK_REGISTRY_URL}/jobs`,
    jobData
  );

  if (res.status !== 201) {
    throw new Error(
      `Failed to create job in TaskRegistry. Status: ${res.status}`
    );
  }
  return res.data;
};
