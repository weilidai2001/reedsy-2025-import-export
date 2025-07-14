import axios from "axios";
import type { Job } from "../types";

export const addJobToScheduler = async (jobData: Job) => {
  const res = await axios.post(`${process.env.SCHEDULER_URL}/queue`, jobData);
  if (res.status !== 201) {
    throw new Error(`Failed to queue job in Scheduler. Status: ${res.status}`);
  }
  return res.data;
};
