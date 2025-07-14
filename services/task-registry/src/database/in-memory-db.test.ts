import { Jobs } from "./in-memory-db";
import { Job, JobSchema } from "../types";

describe("Jobs in-memory database", () => {
  let jobs: Jobs;
  let sampleJob: Job;

  beforeEach(() => {
    jobs = new Jobs();
    sampleJob = {
      requestId: "req-1",
      bookId: "book-1",
      direction: "import",
      type: "epub",
      state: "pending",
      url: "http://example.com/file",
      resultUrl: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  it("inserts a job", async () => {
    const inserted = await jobs.insert(sampleJob);
    expect(inserted).toEqual(sampleJob);
    const all = await jobs.findAll();
    expect(all).toHaveLength(1);
    expect(all[0]).toEqual(sampleJob);
  });

  it("finds all jobs", async () => {
    await jobs.insert(sampleJob);
    await jobs.insert({ ...sampleJob, requestId: "req-2", bookId: "book-2" });
    const all = await jobs.findAll();
    expect(all).toHaveLength(2);
  });

  it("finds many jobs by criteria", async () => {
    await jobs.insert(sampleJob);
    await jobs.insert({ ...sampleJob, requestId: "req-2", bookId: "book-2", direction: "export" });
    const found = await jobs.findMany({ where: { direction: "import" } });
    expect(found).toHaveLength(1);
    expect(found[0].direction).toBe("import");
  });

  it("finds one job by criteria", async () => {
    await jobs.insert(sampleJob);
    await jobs.insert({ ...sampleJob, requestId: "req-2", bookId: "book-2" });
    const found = await jobs.findOne({ where: { requestId: "req-2" } });
    expect(found).toBeDefined();
    expect(found!.requestId).toBe("req-2");
  });

  it("returns undefined if no job matches in findOne", async () => {
    await jobs.insert(sampleJob);
    const found = await jobs.findOne({ where: { requestId: "does-not-exist" } });
    expect(found).toBeUndefined();
  });

  it("updates one job by criteria", async () => {
    await jobs.insert(sampleJob);
    const updated = await jobs.updateOne({ where: { requestId: "req-1" }, data: { state: "finished" } });
    expect(updated).toBeDefined();
    expect(updated!.state).toBe("finished");
    const found = await jobs.findOne({ where: { requestId: "req-1" } });
    expect(found!.state).toBe("finished");
  });

  it("returns undefined when updating a non-existent job", async () => {
    const updated = await jobs.updateOne({ where: { requestId: "not-found" }, data: { state: "finished" } });
    expect(updated).toBeUndefined();
  });
});
