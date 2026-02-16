import { createElement } from "react";
import { createHashRouter, Navigate } from "react-router-dom";
import { ChatPage } from "./presentation/pages/ChatPage";
import { ProjectsPage } from "./presentation/pages/ProjectsPage";
import { WorkspaceLayout } from "./presentation/layouts/WorkspaceLayout";

export const router = createHashRouter([
    {
        path: "/",
        element: createElement(WorkspaceLayout),
        children: [
            {
                index: true,
                element: createElement(Navigate, {
                    to: "/dialogs",
                    replace: true,
                }),
            },
            {
                path: "/dialogs",
                element: createElement(ChatPage),
            },
            {
                path: "/projects",
                element: createElement(ProjectsPage),
            },
        ],
    },
]);
