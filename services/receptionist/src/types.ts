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
  sourceUrl: z.string().optional(),
  resultUrl: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const exportJobSchema = z.object({
  bookId: z.string(),
  type: z.enum(["epub", "pdf"]),
});

export const importJobSchema = z.object({
  bookId: z.string(),
  type: z.enum(["word", "pdf", "wattpad", "evernote"]),
  url: z.string().url(),
});

export const TaskRegistryCreateJobSchema = z.object({
  requestId: z.string().uuid(),
  bookId: z.string().uuid(),
  direction: JobDirectionSchema,
  type: JobTypeSchema,
  sourceUrl: z.string().optional(),
});

export type Job = z.infer<typeof JobSchema>;
