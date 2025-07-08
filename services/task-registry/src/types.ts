import { z } from "zod";

export const JobSchema = z.object({
  requestId: z.string(),
  bookId: z.string(),
  direction: z.enum(["import", "export"]),
  type: z.enum(["epub", "pdf", "word", "wattpad", "evernote"]),
  state: z.enum(["pending", "processing", "finished", "failed"]),
  sourceUrl: z.string().optional(),
  resultUrl: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Job = z.infer<typeof JobSchema>;
