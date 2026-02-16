import { createElement } from "react";
import { createHashRouter, Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { ChatPage } from "./presentation/pages/ChatPage";
import { ProjectsPage } from "./presentation/pages/ProjectsPage";
import { WorkspaceLayout } from "./presentation/layouts/WorkspaceLayout";
import { ProjectPage } from "./presentation/pages/projects/ProjectPage";
import { userProfileStore } from "./stores/userProfileStore";

const HomeRedirect = observer(function HomeRedirect() {
    if (!userProfileStore.isReady) {
        return null;
    }

    const activeProjectId = userProfileStore.userProfile.activeProjectId;

    return createElement(Navigate, {
        to: activeProjectId ? `/projects/${activeProjectId}` : "/dialogs",
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
                element: createElement(ProjectsPage),
            },
            {
                path: "/projects/:projectId",
                element: createElement(ProjectPage),
            },
        ],
    },
]);
