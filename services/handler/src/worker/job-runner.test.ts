import { runSinglePollIteration } from "./job-runner";
import { state } from "./job-state";
import { dequeue } from "../clients/scheduler-client";
import { handleJob } from "./job-manager";
import logger from "../logger";

// Mock dependencies
jest.mock("./job-state", () => ({
  state: {
    isIdle: true,
  },
}));

jest.mock("../clients/scheduler-client", () => ({
  dequeue: jest.fn(),
}));

jest.mock("./job-manager", () => ({
  handleJob: jest.fn(),
}));

jest.mock("../logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

const mockedDequeue = dequeue as jest.Mock;
const mockedHandleJob = handleJob as jest.Mock;
const mockedState = state as { isIdle: boolean };
const mockedLogger = logger as jest.Mocked<typeof logger>;

describe("job-runner", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedState.isIdle = true; // Reset state
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should wait if not idle", async () => {
    mockedState.isIdle = false;

    const promise = runSinglePollIteration();
    await jest.advanceTimersByTimeAsync(1000);
    await promise;

    expect(mockedDequeue).not.toHaveBeenCalled();
    expect(mockedHandleJob).not.toHaveBeenCalled();
  });

  it("should poll for jobs when idle", async () => {
    mockedDequeue.mockResolvedValueOnce(undefined);

    const promise = runSinglePollIteration();
    await jest.advanceTimersByTimeAsync(5000);
    await promise;

    expect(mockedDequeue).toHaveBeenCalledTimes(1);
  });

  it("should log and wait if no job is available", async () => {
    mockedDequeue.mockResolvedValueOnce(undefined);

    const promise = runSinglePollIteration();
    await jest.advanceTimersByTimeAsync(5000);
    await promise;

    expect(mockedLogger.info).toHaveBeenCalledWith(
      "No jobs available for dequeue"
    );
    expect(mockedHandleJob).not.toHaveBeenCalled();
  });

  it("should handle a dequeued job", async () => {
    const job = { id: "job-123", type: "import" };
    mockedDequeue.mockResolvedValueOnce(job);

    await runSinglePollIteration();

    expect(handleJob).toHaveBeenCalledWith(job);
  });
});
