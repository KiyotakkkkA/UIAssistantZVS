import { CreateProjectPage } from "./projects/CreateProjectPage";

export function ProjectsPage() {
    return (
        <section className="flex min-w-0 flex-1 flex-col gap-3 rounded-3xl bg-main-900/70 p-4 backdrop-blur-md">
            <CreateProjectPage />
        </section>
    );
}
