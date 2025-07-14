import { z } from "zod";

export const JobDirectionSchema = z.enum(["import", "export"]);
export const JobTypeSchema = z.enum([
  "epub",
  "pdf",
  "word",
  "wattpad",
  "evernote",
]);
export const JobStateSchema = z.enum([
  "pending",
  "processing",
  "finished",
  "failed",
]);

export const JobSchema = z.object({
  requestId: z.string(),
  bookId: z.string(),
  direction: JobDirectionSchema,
  type: JobTypeSchema,
  state: JobStateSchema,
  url: z.string().optional(),
  resultUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Job = z.infer<typeof JobSchema>;
export type JobDirection = z.infer<typeof JobDirectionSchema>;
export type JobType = z.infer<typeof JobTypeSchema>;
export type JobState = z.infer<typeof JobStateSchema>;

export interface JobResult {
  jobId: string;
  status: JobState;
  resultUrl?: string;
  error?: string;
}

export interface ServiceStatus {
  jobsProcessed: number;
  jobsSucceeded: number;
  jobsFailed: number;
  currentJob: string | null;
  lastJobDurationMs: number | null;
  lastJobError: string | null;
  isIdle: boolean;
  lastJobSuccess: string | null;
}
