import fs from "node:fs";
import { randomUUID } from "node:crypto";
import type {
    CreateProjectPayload,
    Project,
    ProjectListItem,
} from "../../../src/types/Project";
import { DatabaseService } from "../DatabaseService";
import path from "node:path";

export class ProjectsService {
    constructor(private readonly databaseService: DatabaseService) {}

    getProjectsList(): ProjectListItem[] {
        return this.readProjects().map((project) =>
            this.toProjectListItem(project),
        );
    }

    getProjectById(projectId: string): Project | null {
        const projects = this.readProjects();
        return projects.find((project) => project.id === projectId) ?? null;
    }

    createProject(
        payload: CreateProjectPayload & {
            dialogId: string;
            projectId?: string;
        },
    ): Project {
        const now = new Date().toISOString();
        const projectDirectoryPath = this.createProjectDirectory(
            payload.directoryPath,
        );
        const project: Project = {
            id: this.normalizeProjectId(payload.projectId),
            name: payload.name.trim() || "Новый проект",
            description: payload.description.trim(),
            directoryPath: projectDirectoryPath,
            dialogId: payload.dialogId,
            fileUUIDs: this.normalizeFileIds(payload.fileUUIDs),
            requiredTools: this.normalizeRequiredTools(payload.requiredTools),
            createdAt: now,
            updatedAt: now,
        };

        this.writeProject(project);
        return project;
    }

    deleteProject(projectId: string): Project | null {
        const project = this.getProjectById(projectId);

        if (!project) {
            return null;
        }

        this.databaseService.deleteProject(project.id);

        return project;
    }

    private normalizeProjectId(id: unknown): string {
        if (typeof id === "string" && id.startsWith("project_")) {
            return id;
        }

        return `project_${randomUUID().replace(/-/g, "")}`;
    }

    private normalizeFileIds(fileIds: unknown): string[] {
        if (!Array.isArray(fileIds)) {
            return [];
        }

        return fileIds.filter(
            (item): item is string => typeof item === "string",
        );
    }

    private normalizeRequiredTools(requiredTools: unknown): string[] {
        if (!Array.isArray(requiredTools)) {
            return [];
        }

        return requiredTools.filter(
            (item): item is string =>
                typeof item === "string" && item.trim().length > 0,
        );
    }

    private normalizeDirectoryPath(directoryPath: unknown): string {
        if (typeof directoryPath !== "string") {
            return "";
        }

        return directoryPath.trim();
    }

    private createProjectDirectory(baseDirectoryPath: unknown): string {
        const normalizedBaseDirectory =
            this.normalizeDirectoryPath(baseDirectoryPath);

        if (!normalizedBaseDirectory) {
            return "";
        }

        if (!fs.existsSync(normalizedBaseDirectory)) {
            fs.mkdirSync(normalizedBaseDirectory, { recursive: true });
        }

        const folderUuid = randomUUID().replace(/-/g, "");
        const projectDirectoryPath = path.join(
            normalizedBaseDirectory,
            folderUuid,
        );

        if (!fs.existsSync(projectDirectoryPath)) {
            fs.mkdirSync(projectDirectoryPath, { recursive: true });
        }

        return projectDirectoryPath;
    }

    private readProjects(): Project[] {
        const projects: Project[] = [];

        for (const rawItem of this.databaseService.getProjectsRaw()) {
            const parsed = rawItem as Partial<Project>;
            const now = new Date().toISOString();

            if (
                typeof parsed.name !== "string" ||
                typeof parsed.description !== "string" ||
                typeof parsed.dialogId !== "string"
            ) {
                continue;
            }

            projects.push({
                id: this.normalizeProjectId(parsed.id),
                name: parsed.name.trim() || "Новый проект",
                description: parsed.description,
                directoryPath: this.normalizeDirectoryPath(
                    parsed.directoryPath ??
                        (parsed as Partial<Record<string, unknown>>)
                            .projectDirectoryPath ??
                        (parsed as Partial<Record<string, unknown>>)
                            .projectPath,
                ),
                dialogId: parsed.dialogId,
                fileUUIDs: this.normalizeFileIds(
                    parsed.fileUUIDs ??
                        (parsed as Partial<Record<string, unknown>>)
                            .fileUuids ??
                        (parsed as Partial<Record<string, unknown>>).fileIds,
                ),
                requiredTools: this.normalizeRequiredTools(
                    parsed.requiredTools,
                ),
                createdAt:
                    typeof parsed.createdAt === "string" && parsed.createdAt
                        ? parsed.createdAt
                        : now,
                updatedAt:
                    typeof parsed.updatedAt === "string" && parsed.updatedAt
                        ? parsed.updatedAt
                        : now,
            });
        }

        projects.sort((left, right) =>
            right.updatedAt.localeCompare(left.updatedAt),
        );

        return projects;
    }

    private writeProject(project: Project): void {
        this.databaseService.upsertProjectRaw(project.id, project);
    }

    private toProjectListItem(project: Project): ProjectListItem {
        return {
            id: project.id,
            title: project.name,
            preview: project.description.trim() || "Проект без описания",
            time: new Date(project.updatedAt).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            updatedAt: project.updatedAt,
            dialogId: project.dialogId,
        };
    }
}
