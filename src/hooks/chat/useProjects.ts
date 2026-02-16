import { useCallback, useEffect } from "react";
import { projectsStore } from "../../stores/projectsStore";
import type { CreateProjectPayload } from "../../types/Project";

export const useProjects = () => {
    useEffect(() => {
        projectsStore.initialize();
    }, []);

    const createProject = useCallback(async (payload: CreateProjectPayload) => {
        return await projectsStore.createProject(payload);
    }, []);

    const switchProject = useCallback(async (projectId: string) => {
        if (!projectId) {
            return null;
        }

        return await projectsStore.switchProject(projectId);
    }, []);

    const deleteProject = useCallback(async (projectId: string) => {
        if (!projectId) {
            return false;
        }

        return await projectsStore.deleteProject(projectId);
    }, []);

    return {
        isReady: projectsStore.isReady,
        projects: projectsStore.projects,
        activeProject: projectsStore.activeProject,
        activeProjectId: projectsStore.activeProject?.id ?? "",
        createProject,
        switchProject,
        deleteProject,
        clearActiveProject: projectsStore.clearActiveProject,
    };
};
