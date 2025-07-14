import { initialiseJob, groupJobsByState, transformJobToMatchOutputSchema } from "./jobs-transformer";
import { Job, exportJobSchema, importJobSchema } from "../types";
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

describe("transformJobToMatchOutputSchema", () => {
  it("should return the correct output schema for a normal job", () => {
    const job: Job = {
      requestId: "abc",
      bookId: "book123",
      direction: "import",
      type: "epub",
      state: "pending",
      url: "http://test.com",
      createdAt: "2025-07-09T13:51:49.000Z",
      updatedAt: "2025-07-09T13:51:49.000Z",
      resultUrl: undefined,
    };
    expect(transformJobToMatchOutputSchema(job)).toEqual({
      bookId: "book123",
      type: "epub",
      url: "http://test.com",
      created_at: "2025-07-09T13:51:49.000Z",
      updated_at: "2025-07-09T13:51:49.000Z",
    });
  });

  it("should handle missing optional fields", () => {
    const job = {
      bookId: "b1",
      type: "pdf",
      url: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    } as unknown as Job;
    expect(transformJobToMatchOutputSchema(job)).toEqual({
      bookId: "b1",
      type: "pdf",
      url: undefined,
      created_at: undefined,
      updated_at: undefined,
    });
  });

  it("should ignore extra fields in the job object", () => {
    const job = {
      bookId: "b2",
      type: "epub",
      url: "foo",
      createdAt: "2025-01-01",
      updatedAt: "2025-01-02",
      foo: "bar",
      extra: 123,
    } as unknown as Job;
    expect(transformJobToMatchOutputSchema(job)).toEqual({
      bookId: "b2",
      type: "epub",
      url: "foo",
      created_at: "2025-01-01",
      updated_at: "2025-01-02",
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
      pending: [
        {
          bookId: "b1",
          type: "epub",
          url: undefined,
          created_at: now,
          updated_at: now,
        },
        {
          bookId: "b3",
          type: "epub",
          url: undefined,
          created_at: now,
          updated_at: now,
        },
      ],
      processing: [
        {
          bookId: "b2",
          type: "pdf",
          url: undefined,
          created_at: now,
          updated_at: now,
        },
      ],
      failed: [
        {
          bookId: "b4",
          type: "pdf",
          url: undefined,
          created_at: now,
          updated_at: now,
        },
      ],
      finished: [
        {
          bookId: "b5",
          type: "epub",
          url: undefined,
          created_at: now,
          updated_at: now,
        },
      ],
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
      pending: jobs.map(transformJobToMatchOutputSchema),
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
      pending: [transformJobToMatchOutputSchema(jobs[0])],
      processing: [transformJobToMatchOutputSchema(jobs[1])],
      failed: [transformJobToMatchOutputSchema(jobs[2])],
    });
  });
});
