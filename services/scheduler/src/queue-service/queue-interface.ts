import { Job } from "../types";

// This interface models a typical interface used by real queue services like RabbitMQ
export interface QueueService {
  sendToQueue(message: Job): Promise<void>;

  consume(): Promise<Job | undefined>;
}
