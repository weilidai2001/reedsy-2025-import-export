import axios from "axios";
import type { Job } from "../types";
import { JobDirectionSchema } from "../types";
import z from "zod";

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

export const getJobsByDirection = async (
  direction: z.infer<typeof JobDirectionSchema>
): Promise<Job[]> => {
  const taskRegistryRes = await axios.get(
    `${process.env.TASK_REGISTRY_URL}/jobs?direction=${direction}`
  );

  if (taskRegistryRes.status !== 200) {
    throw new Error(
      `Failed to get jobs from TaskRegistry. Status: ${taskRegistryRes.status}`
    );
  }

  const jobs = taskRegistryRes.data as Job[];
  return jobs;
};
