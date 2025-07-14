import { Job } from "types";
import { DatabaseInterface } from "./db-interface";

export class Jobs implements DatabaseInterface<Job> {
  private db: Job[] = [];

  insert(data: Job): Promise<Job> {
    this.db.push(data);
    return Promise.resolve(data);
  }

  findAll(): Promise<Job[]> {
    return Promise.resolve([...this.db]);
  }

  findMany({ where }: { where: Partial<Job> }): Promise<Job[]> {
    return Promise.resolve(
      this.db.filter((job) =>
        Object.entries(where).every(
          ([key, val]) => job[key as keyof Job] === val
        )
      )
    );
  }

  findOne({ where }: { where: Partial<Job> }): Promise<Job | undefined> {
    return Promise.resolve(
      this.db.find((job) =>
        Object.entries(where).every(
          ([key, val]) => job[key as keyof Job] === val
        )
      )
    );
  }

  updateOne({
    where,
    data,
  }: {
    where: Partial<Job>;
    data: Partial<Job>;
  }): Promise<Job | undefined> {
    const index = this.db.findIndex((job) =>
      Object.entries(where).every(([key, val]) => job[key as keyof Job] === val)
    );

    if (index === -1) return Promise.resolve(undefined);

    this.db[index] = { ...this.db[index], ...data };
    return Promise.resolve(this.db[index]);
  }

  deleteAll(): Promise<void> {
    this.db = [];
    return Promise.resolve();
  }
}
