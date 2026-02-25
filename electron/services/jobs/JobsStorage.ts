import type {
    CreateJobPayload,
    JobEventRecord,
    JobEventTag,
    JobRecord,
} from "../../../src/types/ElectronApi";
import { DatabaseService } from "../storage/DatabaseService";

export class JobsStorage {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly resolveCurrentUserId: () => string,
    ) {}

    getJobs(): JobRecord[] {
        return this.databaseService.getJobs(this.resolveCurrentUserId());
    }

    getJobById(jobId: string): JobRecord | null {
        return this.databaseService.getJobById(
            jobId,
            this.resolveCurrentUserId(),
        );
    }

    getJobEvents(jobId: string): JobEventRecord[] {
        return this.databaseService.getJobEvents(
            jobId,
            this.resolveCurrentUserId(),
        );
    }

    createJob(payload: CreateJobPayload): JobRecord {
        const name = payload.name.trim() || "Фоновая задача";
        const description = payload.description?.trim() || "";

        return this.databaseService.createJob(this.resolveCurrentUserId(), {
            name,
            description,
        });
    }

    appendJobEvent(
        jobId: string,
        message: string,
        tag: JobEventTag,
    ): JobEventRecord {
        return this.databaseService.addJobEvent(
            this.resolveCurrentUserId(),
            jobId,
            message,
            tag,
        );
    }

    updateJob(
        jobId: string,
        payload: {
            isCompleted?: boolean;
            isPending?: boolean;
            finishedAt?: string | null;
            errorMessage?: string | null;
        },
    ): JobRecord | null {
        return this.databaseService.updateJob(
            jobId,
            this.resolveCurrentUserId(),
            payload,
        );
    }

    markPendingJobsAsInterrupted(): string[] {
        return this.databaseService.markPendingJobsAsInterrupted(
            this.resolveCurrentUserId(),
        );
    }
}
