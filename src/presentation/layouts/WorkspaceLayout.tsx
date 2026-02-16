import { Outlet } from "react-router-dom";
import { ChatSidebar } from "../components/organisms/chat";

export function WorkspaceLayout() {
    return (
        <main className="h-screen w-screen overflow-hidden bg-main-900 p-3 text-main-100">
            <div className="flex h-full w-full gap-3">
                <ChatSidebar />
                <Outlet />
            </div>
        </main>
    );
}
