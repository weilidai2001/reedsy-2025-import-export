import { Jobs } from "./data";
import { Job } from "./types";

export const insertJob = (job: Omit<Job, "createdAt" | "updatedAt">) => {
  Jobs.create(job);
};

export const updateJob = (
  job: Pick<Job, "requestId" | "state" | "resultUrl">
) => {
  const jobRecord = Jobs.findOne({ where: { requestId: job.requestId } });
  if (!jobRecord) {
    return;
  }

  jobRecord.state = job.state;
  jobRecord.resultUrl = job.resultUrl;
  jobRecord.save();
};

export const selectAllJobs = () => {
  return Jobs.findAll()?.map((job) => job.toJSON());
};

export const selectJobsByDirection = (direction: Job["direction"]) => {
  return Jobs.findMany({ where: { direction } })?.map((job) => job.toJSON());
};

export const selectJobById = (requestId: Job["requestId"]) => {
  return Jobs.findOne({ where: { requestId } })?.toJSON();
};
