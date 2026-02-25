import { Loader } from "../components/atoms";

type LoadingFallbackPageProps = {
    title?: string;
    subtitle?: string;
};

export const LoadingFallbackPage = ({
    title = "Загрузка данных...",
    subtitle,
}: LoadingFallbackPageProps) => {
    return (
        <section className="animate-page-fade-in flex h-full w-full min-w-0 flex-1 flex-col items-center justify-center gap-3 rounded-3xl bg-main-900/70 backdrop-blur-md">
            <Loader className="h-6 w-6" />
            <p className="text-sm text-main-300">{title}</p>
            {subtitle ? (
                <p className="text-xs text-main-400">{subtitle}</p>
            ) : null}
        </section>
    );
};
