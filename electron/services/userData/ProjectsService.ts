import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
    CreateProjectPayload,
    Project,
    ProjectListItem,
} from "../../../src/types/Project";

export class ProjectsService {
    constructor(private readonly projectsPath: string) {}

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
        const project: Project = {
            id: this.normalizeProjectId(payload.projectId),
            name: payload.name.trim() || "Новый проект",
            description: payload.description.trim(),
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

        const projectPath = path.join(this.projectsPath, `${project.id}.json`);

        if (fs.existsSync(projectPath)) {
            fs.unlinkSync(projectPath);
        }

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

    private readProjects(): Project[] {
        if (!fs.existsSync(this.projectsPath)) {
            return [];
        }

        const files = fs
            .readdirSync(this.projectsPath)
            .filter((fileName) => fileName.endsWith(".json"));

        const projects: Project[] = [];

        for (const fileName of files) {
            const filePath = path.join(this.projectsPath, fileName);

            try {
                const raw = fs.readFileSync(filePath, "utf-8");
                const parsed = JSON.parse(raw) as Partial<Project>;
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
                    dialogId: parsed.dialogId,
                    fileUUIDs: this.normalizeFileIds(
                        parsed.fileUUIDs ??
                            (parsed as Partial<Record<string, unknown>>)
                                .fileUuids ??
                            (parsed as Partial<Record<string, unknown>>)
                                .fileIds,
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
            } catch {
                continue;
            }
        }

        projects.sort((left, right) =>
            right.updatedAt.localeCompare(left.updatedAt),
        );

        return projects;
    }

    private writeProject(project: Project): void {
        if (!fs.existsSync(this.projectsPath)) {
            fs.mkdirSync(this.projectsPath, { recursive: true });
        }

        const projectPath = path.join(this.projectsPath, `${project.id}.json`);
        fs.writeFileSync(projectPath, JSON.stringify(project, null, 2));
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
