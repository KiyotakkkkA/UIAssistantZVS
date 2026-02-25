import { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

type NavigationTab = {
    id: "workspace" | "storage";
    label: string;
    to: string;
    icon: string;
};

const navigationTabs: NavigationTab[] = [
    {
        id: "workspace",
        label: "Рабочая зона",
        to: "/workspace",
        icon: "mdi:view-grid-outline",
    },
    {
        id: "storage",
        label: "Хранилище",
        to: "/storage",
        icon: "mdi:database-outline",
    },
];

export const NavigationMenuLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const activeTabId = useMemo(() => {
        if (location.pathname.startsWith("/storage")) {
            return "storage";
        }

        return "workspace";
    }, [location.pathname]);

    return (
        <main className="h-screen w-screen overflow-hidden bg-main-900 p-3 text-main-100">
            <div className="flex h-full w-full gap-3">
                <aside
                    className={`flex h-full shrink-0 flex-col rounded-3xl bg-main-800/70 p-3 backdrop-blur-md w-55`}
                >
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-main-400">
                            Навигация
                        </p>
                    </div>
                    <nav className="space-y-2">
                        {navigationTabs.map((tab) => {
                            const isActive = tab.id === activeTabId;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => navigate(tab.to)}
                                    className={`flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm transition-colors cursor-pointer ${
                                        isActive
                                            ? "bg-main-700/60 text-main-100"
                                            : "text-main-300 hover:bg-main-800/60 hover:text-main-100"
                                    }`}
                                    title={tab.label}
                                >
                                    <Icon
                                        icon={tab.icon}
                                        width={18}
                                        height={18}
                                    />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <section className="min-w-0 flex-1">
                    <Outlet />
                </section>
            </div>
        </main>
    );
};
