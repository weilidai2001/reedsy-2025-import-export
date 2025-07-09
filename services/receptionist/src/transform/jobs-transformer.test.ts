import { initialiseJob, groupJobsByState } from "./jobs-transformer";
import { exportJobSchema, importJobSchema, Job } from "../types";
import { z } from "zod";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid"),
}));

describe("initialiseJob", () => {
  const now = "2025-07-09T13:51:49.000Z";
  beforeAll(() => {
    jest.spyOn(global, "Date").mockImplementation(
      () =>
        ({
          toISOString: () => now,
        } as unknown as Date)
    );
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should initialise job from exportJobSchema with url", () => {
    const partialJob = {
      bookId: "book1",
      type: "export",
      url: "http://example.com",
    };
    const direction = "export";
    const job = initialiseJob(
      partialJob as z.infer<typeof exportJobSchema>,
      direction
    );

    expect(job).toEqual({
      requestId: "test-uuid",
      bookId: "book1",
      direction: "export",
      type: "export",
      state: "pending",
      url: "http://example.com",
      createdAt: now,
      updatedAt: now,
    });
  });

  it("should initialise job from importJobSchema without url", () => {
    const partialJob = {
      bookId: "book2",
      type: "import",
    };
    const direction = "import";
    const job = initialiseJob(
      partialJob as z.infer<typeof importJobSchema>,
      direction
    );

    expect(job).toEqual({
      requestId: "test-uuid",
      bookId: "book2",
      direction: "import",
      type: "import",
      state: "pending",
      url: undefined,
      createdAt: now,
      updatedAt: now,
    });
  });
});

describe("groupJobsByState", () => {
  const now = "2025-07-09T13:51:49.000Z";
  const baseJob: Omit<
    Job,
    "requestId" | "bookId" | "direction" | "type" | "state"
  > = {
    url: undefined,
    resultUrl: undefined,
    createdAt: now,
    updatedAt: now,
  };
  it("should group jobs by their state", () => {
    const jobs: Job[] = [
      {
        requestId: "1",
        bookId: "b1",
        direction: "import",
        type: "epub",
        state: "pending",
        ...baseJob,
      },
      {
        requestId: "2",
        bookId: "b2",
        direction: "import",
        type: "pdf",
        state: "processing",
        ...baseJob,
      },
      {
        requestId: "3",
        bookId: "b3",
        direction: "export",
        type: "epub",
        state: "pending",
        ...baseJob,
      },
      {
        requestId: "4",
        bookId: "b4",
        direction: "export",
        type: "pdf",
        state: "failed",
        ...baseJob,
      },
      {
        requestId: "5",
        bookId: "b5",
        direction: "import",
        type: "epub",
        state: "finished",
        ...baseJob,
      },
    ];
    const grouped = groupJobsByState(jobs);
    expect(grouped).toEqual({
      pending: [jobs[0], jobs[2]],
      processing: [jobs[1]],
      failed: [jobs[3]],
      finished: [jobs[4]],
    });
  });

  it("should return an empty object for an empty array", () => {
    expect(groupJobsByState([])).toEqual({});
  });

  it("should group all jobs under one state if all have the same state", () => {
    const jobs: Job[] = [
      {
        requestId: "1",
        bookId: "b1",
        direction: "import",
        type: "epub",
        state: "pending",
        ...baseJob,
      },
      {
        requestId: "2",
        bookId: "b2",
        direction: "import",
        type: "pdf",
        state: "pending",
        ...baseJob,
      },
    ];
    expect(groupJobsByState(jobs)).toEqual({
      pending: jobs,
    });
  });

  it("should group each job separately if all have different states", () => {
    const jobs: Job[] = [
      {
        requestId: "1",
        bookId: "b1",
        direction: "import",
        type: "epub",
        state: "pending",
        ...baseJob,
      },
      {
        requestId: "2",
        bookId: "b2",
        direction: "import",
        type: "pdf",
        state: "processing",
        ...baseJob,
      },
      {
        requestId: "3",
        bookId: "b3",
        direction: "export",
        type: "epub",
        state: "failed",
        ...baseJob,
      },
    ];
    expect(groupJobsByState(jobs)).toEqual({
      pending: [jobs[0]],
      processing: [jobs[1]],
      failed: [jobs[2]],
    });
  });
});
