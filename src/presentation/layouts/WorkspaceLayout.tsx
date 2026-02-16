import { observer } from "mobx-react-lite";
import { Outlet } from "react-router-dom";
import { useDialogs, useProjects } from "../../hooks";
import { Loader } from "../components/atoms";
import { ChatSidebar } from "../components/organisms/chat";

export const WorkspaceLayout = observer(function WorkspaceLayout() {
    const { isReady: isDialogsReady } = useDialogs();
    const { isReady: isProjectsReady } = useProjects();
    const isWorkspaceReady = isDialogsReady && isProjectsReady;

    return (
        <main className="h-screen w-screen overflow-hidden bg-main-900 p-3 text-main-100">
            {isWorkspaceReady ? (
                <div className="flex h-full w-full gap-3">
                    <ChatSidebar />
                    <Outlet />
                </div>
            ) : (
                <section className="flex h-full w-full items-center justify-center rounded-3xl bg-main-900/70 backdrop-blur-md">
                    <div className="flex items-center gap-3 text-sm text-main-300">
                        <Loader className="h-6 w-6" />
                        <span>Загрузка рабочей области...</span>
                    </div>
                </section>
            )}
        </main>
    );
});
