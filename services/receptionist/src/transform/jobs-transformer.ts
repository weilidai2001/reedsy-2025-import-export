import { exportJobSchema, importJobSchema, JobDirectionSchema } from "../types";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export const createJob = (
  partialJob: z.infer<typeof exportJobSchema> | z.infer<typeof importJobSchema>,
  direction: z.infer<typeof JobDirectionSchema>
) => {
  const now = new Date().toISOString();
  // Prepare job data based on direction
  const jobData: Job = {
    requestId: uuidv4(),
    bookId: partialJob.bookId,
    direction,
    type: partialJob.type,
    state: "pending",
    url: direction === "import" ? partialJob.url : undefined,
    createdAt: now,
    updatedAt: now,
  };
  return jobData;
};
