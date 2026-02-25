import { observer } from "mobx-react-lite";
import { Outlet } from "react-router-dom";
import { useDialogs, useProjects } from "../../hooks";
import { useScenario } from "../../hooks/agents";
import { ChatSidebar } from "../components/organisms/chat";
import { LoadingFallbackPage } from "../pages/LoadingFallbackPage";

export const WorkspaceLayout = observer(function WorkspaceLayout() {
    const { isReady: isDialogsReady } = useDialogs();
    const { isReady: isProjectsReady } = useProjects();
    const { isReady: isScenariosReady } = useScenario();
    const isWorkspaceReady =
        isDialogsReady && isProjectsReady && isScenariosReady;

    return isWorkspaceReady ? (
        <div className="flex h-full w-full gap-3">
            <ChatSidebar />
            <Outlet />
        </div>
    ) : (
        <LoadingFallbackPage title="Загрузка рабочей области..." />
    );
});
