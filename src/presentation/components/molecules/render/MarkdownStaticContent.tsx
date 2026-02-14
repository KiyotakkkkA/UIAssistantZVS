import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ShikiCodeBlock } from "./ShikiCodeBlock";

interface MarkdownStaticContentProps {
    content: string;
    className?: string;
}

export function MarkdownStaticContent({
    content,
    className,
}: MarkdownStaticContentProps) {
    return (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                        <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => <li>{children}</li>,
                    blockquote: ({ children }) => (
                        <blockquote className="mb-2 border-l-2 border-neutral-400/40 pl-3 italic text-neutral-300 last:mb-0">
                            {children}
                        </blockquote>
                    ),
                    code: ({
                        className: codeClassName,
                        children,
                        ...props
                    }) => {
                        const rawCode = String(children).replace(/\n$/, "");
                        const isInline =
                            !codeClassName && !String(children).includes("\n");

                        if (isInline) {
                            return (
                                <code
                                    className="rounded bg-neutral-900/80 px-1.5 py-0.5 text-[12px] text-neutral-100"
                                    {...props}
                                >
                                    {children}
                                </code>
                            );
                        }

                        const language =
                            codeClassName?.replace("language-", "") ||
                            "plaintext";

                        return (
                            <ShikiCodeBlock
                                code={rawCode}
                                language={language}
                            />
                        );
                    },
                    pre: ({ children }) => <>{children}</>,
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="underline decoration-neutral-400/80 underline-offset-2"
                        >
                            {children}
                        </a>
                    ),
                    h1: ({ children }) => (
                        <h1 className="mb-2 text-base font-semibold">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="mb-2 text-sm font-semibold">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="mb-1 text-sm font-semibold">
                            {children}
                        </h3>
                    ),
                    hr: () => <hr className="my-3 border-neutral-400/20" />,
                    table: ({ children }) => (
                        <div className="mb-2 overflow-x-auto rounded-xl border border-neutral-400/20 bg-neutral-900/50 last:mb-0">
                            <table className="w-full min-w-130 table-auto border-collapse text-xs sm:text-sm">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="border-b border-neutral-400/20 bg-neutral-800/70 text-left text-neutral-200">
                            {children}
                        </thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-neutral-400/15">
                            {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="align-top even:bg-neutral-800/35 hover:bg-neutral-800/50 transition-colors">
                            {children}
                        </tr>
                    ),
                    th: ({ children }) => (
                        <th className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-300">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-3 py-2 text-neutral-100/90">
                            {children}
                        </td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
