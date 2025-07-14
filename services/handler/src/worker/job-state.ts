export const state = {
  isIdle: true,
  jobsProcessed: 0,
  jobsSucceeded: 0,
  jobsFailed: 0,
  currentJob: null as string | null,
  lastJobDurationMs: 0,
  lastJobError: null as string | null,
  lastJobSuccess: null as string | null,

  setIdle(value: boolean) {
    this.isIdle = value;
  },

  recordSuccess(jobId: string, duration: number) {
    this.jobsProcessed++;
    this.jobsSucceeded++;
    this.currentJob = null;
    this.lastJobDurationMs = duration;
    this.lastJobError = null;
    this.lastJobSuccess = new Date().toISOString();
  },

  recordFailure(jobId: string, duration: number, err: any) {
    this.jobsProcessed++;
    this.jobsFailed++;
    this.currentJob = null;
    this.lastJobDurationMs = duration;
    this.lastJobError = err.message || "Unknown error";
  },
};
