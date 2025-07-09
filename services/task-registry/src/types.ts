import { z } from "zod";

const JobDirectionSchema = z.enum(["import", "export"]);
const JobTypeSchema = z.enum(["epub", "pdf", "word", "wattpad", "evernote"]);
const JobStateSchema = z.enum(["pending", "processing", "finished", "failed"]);

export const JobSchema = z.object({
  requestId: z.string(),
  bookId: z.string(),
  direction: JobDirectionSchema,
  type: JobTypeSchema,
  state: JobStateSchema,
  url: z.string().optional(),
  resultUrl: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const TaskRegistryCreateJobSchema = z.object({
  requestId: z.string().uuid(),
  bookId: z.string().uuid(),
  state: JobStateSchema,
  direction: JobDirectionSchema,
  type: JobTypeSchema,
  url: z.string().optional(),
});

export const TaskRegistryUpdateJobSchema = z.object({
  state: JobStateSchema,
  resultUrl: z.string().optional(),
});

export type Job = z.infer<typeof JobSchema>;
