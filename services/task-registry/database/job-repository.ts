import { Jobs } from "./in-memory-db";
import { Job } from "../src/types";

const jobRepository = new Jobs();

export const insertJob = (job: Job) => {
  return jobRepository.insert(job);
};

export const updateJob = (job: Job) => {
  return jobRepository.updateOne({
    where: { requestId: job.requestId },
    data: job,
  });
};

export const selectAllJobs = () => {
  return jobRepository.findAll();
};

export const selectJobsByDirection = (direction: Job["direction"]) => {
  return jobRepository.findMany({ where: { direction } });
};

export const selectJobById = (requestId: Job["requestId"]) => {
  return jobRepository.findOne({ where: { requestId } });
};
