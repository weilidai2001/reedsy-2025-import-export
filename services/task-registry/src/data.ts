import { Job } from "types";

const db: Job[] = [];

class JobRecord {
  private data: Job;

  constructor(data: Job) {
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
      db[index] = this.data;
    }
  }
}

export class Jobs {
  static create(job: Job): JobRecord {
    db.push(job);
    return new JobRecord(job);
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
