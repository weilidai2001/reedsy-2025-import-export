import { z } from "zod";

// Define the enum values once using Zod
export const JobDirectionEnum = z.enum(["import", "export"]);
export const JobTypeEnum = z.enum([
  "epub",
  "pdf",
  "word",
  "wattpad",
  "evernote",
]);
export const JobStateEnum = z.enum([
  "pending",
  "processing",
  "finished",
  "failed",
]);

// Extract TypeScript types from the Zod schemas
export type JobDirection = z.infer<typeof JobDirectionEnum>;
export type JobType = z.infer<typeof JobTypeEnum>;
export type JobState = z.infer<typeof JobStateEnum>;

// Define the Job schema using Zod
export const JobSchema = z.object({
  requestId: z.string(),
  bookId: z.string(),
  direction: JobDirectionEnum,
  type: JobTypeEnum,
  state: JobStateEnum,
  sourceUrl: z.string().optional(),
  resultUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Extract the Job type from the schema
export type Job = z.infer<typeof JobSchema>;
