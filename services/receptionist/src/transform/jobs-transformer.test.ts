import { initialiseJob } from "./jobs-transformer";
import { exportJobSchema, importJobSchema } from "../types";
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
