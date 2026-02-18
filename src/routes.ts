import { createElement } from "react";
import { createHashRouter, Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { ChatPage } from "./presentation/pages/ChatPage";
import { CreateProjectPage } from "./presentation/pages/projects/CreateProjectPage";
import { WorkspaceLayout } from "./presentation/layouts/WorkspaceLayout";
import { ProjectPage } from "./presentation/pages/projects/ProjectPage";
import { CreateScenarioPage } from "./presentation/pages/scenario/CreateScenarioPage";
import { ScenarioPage } from "./presentation/pages/scenario/ScenarioPage";
import { userProfileStore } from "./stores/userProfileStore";

const HomeRedirect = observer(function HomeRedirect() {
    if (!userProfileStore.isReady) {
        return null;
    }

    const { activeProjectId, activeScenarioId, lastActiveTab } =
        userProfileStore.userProfile;
    const targetPath =
        lastActiveTab === "scenario" && activeScenarioId
            ? `/scenario/${activeScenarioId}`
            : lastActiveTab === "projects" && activeProjectId
              ? `/projects/${activeProjectId}`
              : "/dialogs";

    return createElement(Navigate, {
        to: targetPath,
        replace: true,
    });
});

export const router = createHashRouter([
    {
        path: "/",
        element: createElement(WorkspaceLayout),
        children: [
            {
                index: true,
                element: createElement(HomeRedirect),
            },
            {
                path: "/dialogs",
                element: createElement(ChatPage),
            },
            {
                path: "/projects",
                element: createElement(Navigate, {
                    to: "/projects/create",
                    replace: true,
                }),
            },
            {
                path: "/projects/create",
                element: createElement(CreateProjectPage),
            },
            {
                path: "/projects/:projectId",
                element: createElement(ProjectPage),
            },
            {
                path: "/scenario",
                element: createElement(Navigate, {
                    to: "/scenario/create",
                    replace: true,
                }),
            },
            {
                path: "/scenario/create",
                element: createElement(CreateScenarioPage),
            },
            {
                path: "/scenario/:scenarioId",
                element: createElement(ScenarioPage),
            },
        ],
    },
]);
