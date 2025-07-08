import db from "./db";
import { Job } from "shared/types";

export function initializeJobsTable() {
  db.run(`CREATE TABLE IF NOT EXISTS jobs (
    requestId TEXT PRIMARY KEY,
    bookId TEXT NOT NULL,
    direction TEXT NOT NULL,
    type TEXT NOT NULL,
    state TEXT NOT NULL,
    sourceUrl TEXT,
    resultUrl TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    startedAt TEXT
  );`);
}

export function createJob(job: Job, callback: (err: Error | null) => void) {
  const stmt = db.prepare(`INSERT INTO jobs (
    requestId, bookId, direction, type, state, sourceUrl, resultUrl, createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(
    job.requestId,
    job.bookId,
    job.direction,
    job.type,
    job.state,
    job.sourceUrl,
    job.resultUrl,
    job.createdAt,
    job.updatedAt,
    callback
  );
  stmt.finalize();
}

export function updateJob(
  id: string,
  updates: Partial<Job>,
  callback: (err: Error | null) => void
) {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(updates);
  const sql = `UPDATE jobs SET ${fields}, updatedAt = datetime('now') WHERE requestId = ?`;
  db.run(sql, ...values, id, callback);
}

export function getJobById(
  id: string,
  callback: (err: Error | null, job?: Job) => void
) {
  db.get(
    "SELECT * FROM jobs WHERE requestId = ?",
    [id],
    (err: Error | null, row: unknown) => {
      callback(err, row as Job);
    }
  );
}

export function listJobs(
  direction?: string,
  callback?: (err: Error | null, jobs?: Job[]) => void
) {
  let sql = "SELECT * FROM jobs";
  const params: string[] = [];
  if (direction) {
    sql += " WHERE direction = ?";
    params.push(direction);
  }
  db.all(sql, params, (err: Error | null, rows: unknown[]) => {
    if (callback) callback(err, rows as Job[]);
  });
}
