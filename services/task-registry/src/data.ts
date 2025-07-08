import { Job } from "types";

type InternalJob = Job & {
  createdAt: string;
  updatedAt: string;
};

const db: InternalJob[] = [];

class JobRecord {
  private data: InternalJob;

  constructor(data: InternalJob) {
    this.data = data;
  }

  get requestId() {
    return this.data.requestId;
  }

  get state() {
    return this.data.state;
  }

  set state(newState: Job["state"]) {
    this.data.state = newState;
  }

  get resultUrl() {
    return this.data.resultUrl;
  }

  set resultUrl(url: Job["resultUrl"]) {
    this.data.resultUrl = url;
  }

  toJSON(): Job {
    return this.data;
  }

  async save(): Promise<void> {
    const index = db.findIndex((j) => j.requestId === this.data.requestId);
    if (index !== -1) {
      this.data.updatedAt = new Date().toISOString();
      db[index] = this.data;
    }
  }
}

export class Jobs {
  static create(job: Omit<Job, "createdAt" | "updatedAt">): JobRecord {
    const now = new Date().toISOString();
    const record: InternalJob = {
      ...job,
      createdAt: now,
      updatedAt: now,
    };
    db.push(record);
    return new JobRecord(record);
  }

  static findAll(): JobRecord[] {
    return db.map((job) => new JobRecord(job));
  }

  static findMany({ where }: { where: Partial<Job> }): JobRecord[] {
    return db
      .filter((job) =>
        Object.entries(where).every(
          ([key, val]) => job[key as keyof Job] === val
        )
      )
      .map((job) => new JobRecord(job));
  }

  static findOne({ where }: { where: Partial<Job> }): JobRecord | undefined {
    const entry = db.find((job) =>
      Object.entries(where).every(([key, val]) => job[key as keyof Job] === val)
    );
    return entry ? new JobRecord(entry) : undefined;
  }
}
