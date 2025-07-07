export type JobDirection = "import" | "export";
export type JobType = "epub" | "pdf" | "word" | "wattpad" | "evernote";
export type JobState = "pending" | "processing" | "finished" | "failed";
export type Job = {
    id: string;
    bookId: string;
    direction: JobDirection;
    type: JobType;
    state: JobState;
    sourceUrl?: string;
    resultUrl?: string;
    createdAt: string;
    updatedAt: string;
    startedAt?: string;
};
//# sourceMappingURL=types.d.ts.map