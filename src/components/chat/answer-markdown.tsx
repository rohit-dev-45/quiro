"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Separator } from "@/components/ui/separator";

type HastNode = {
    type: string;
    value?: string;
    tagName?: string;
    properties?: Record<string, unknown>;
    children?: HastNode[];
};

function rehypeCitations() {
    return (tree: HastNode) => {
        const walk = (node: HastNode) => {
            if (!node.children) return;

            if (node.tagName === "code" || node.tagName === "pre") return;

            const next: HastNode[] = [];

            for (const child of node.children) {
                if (child.type !== "text" || !child.value?.includes("[")) {
                    walk(child);
                    next.push(child);
                    continue;
                }

                for (const part of child.value.split(/(\[\d+(?::\d+)?\])/g)) {
                    if (!part) continue;

                    const marker = /^\[(\d+)(?::(\d+))?\]$/.exec(part);

                    if (marker) {
                        next.push({
                            type: "element",
                            tagName: "sup",
                            properties: {
                                className: ["citation"],
                                "data-source": marker[1],
                                ...(marker[2] === undefined
                                    ? {}
                                    : { "data-passage": marker[2] }),
                            },
                            children: [
                                { type: "text", value: `[${marker[1]}]` },
                            ],
                        });
                    } else {
                        next.push({ type: "text", value: part });
                    }
                }
            }

            node.children = next;
        };

        walk(tree);

        return tree;
    };
}

type MarkdownProps<T extends keyof React.JSX.IntrinsicElements> =
    React.ComponentProps<T> & { node?: unknown };

function omitNode<T extends { node?: unknown }>(props: T) {
    const rest = { ...props };
    delete rest.node;

    return rest;
}

function createComponents(
    onCitationSelect?: (source: number, passage: number | null) => void,
) {
    return {
        h1: (props: MarkdownProps<"h1">) => (
            <h2
                className="mt-6 mb-2 text-lg font-bold tracking-tight first:mt-0"
                {...omitNode(props)}
            />
        ),
        h2: (props: MarkdownProps<"h2">) => (
            <h2
                className="mt-6 mb-2 text-lg font-bold tracking-tight first:mt-0"
                {...omitNode(props)}
            />
        ),
        h3: (props: MarkdownProps<"h3">) => (
            <h3
                className="mt-5 mb-1.5 font-semibold first:mt-0"
                {...omitNode(props)}
            />
        ),
        h4: (props: MarkdownProps<"h4">) => (
            <h4
                className="mt-4 mb-1.5 font-semibold first:mt-0"
                {...omitNode(props)}
            />
        ),
        p: (props: MarkdownProps<"p">) => (
            <p
                className="my-3 leading-relaxed first:mt-0 last:mb-0"
                {...omitNode(props)}
            />
        ),
        ul: (props: MarkdownProps<"ul">) => (
            <ul
                className="my-3 ml-5 list-disc first:mt-0 last:mb-0"
                {...omitNode(props)}
            />
        ),
        ol: (props: MarkdownProps<"ol">) => (
            <ol
                className="my-3 ml-5 list-decimal first:mt-0 last:mb-0"
                {...omitNode(props)}
            />
        ),
        li: (props: MarkdownProps<"li">) => (
            <li className="mt-1.5 leading-relaxed" {...omitNode(props)} />
        ),
        strong: (props: MarkdownProps<"strong">) => (
            <strong className="font-semibold" {...omitNode(props)} />
        ),
        blockquote: (props: MarkdownProps<"blockquote">) => (
            <blockquote
                className="my-3 border-s-2 ps-4 text-muted-foreground italic"
                {...omitNode(props)}
            />
        ),
        hr: () => <Separator className="my-6" />,
        a: (props: MarkdownProps<"a">) => (
            <a
                className="underline underline-offset-4 hover:text-primary"
                {...omitNode(props)}
                target="_blank"
                rel="noreferrer noopener"
            />
        ),
        code: (props: MarkdownProps<"code">) => (
            <code
                className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
                {...omitNode(props)}
            />
        ),
        pre: (props: MarkdownProps<"pre">) => (
            <pre
                className="my-3 overflow-x-auto rounded-lg bg-muted p-3 text-sm [&_code]:bg-transparent [&_code]:p-0"
                {...omitNode(props)}
            />
        ),
        table: (props: MarkdownProps<"table">) => (
            <div className="my-3 overflow-x-auto rounded-lg border">
                <table className="w-full text-sm" {...omitNode(props)} />
            </div>
        ),
        th: (props: MarkdownProps<"th">) => (
            <th
                className="border-b bg-surface px-3 py-2 text-left font-semibold"
                {...omitNode(props)}
            />
        ),
        td: (props: MarkdownProps<"td">) => (
            <td
                className="border-b px-3 py-2 align-top last:border-0"
                {...omitNode(props)}
            />
        ),
        sup: ({ children, ...props }: MarkdownProps<"sup">) => {
            const rest = omitNode(props) as Record<string, unknown>;
            const source = Number(rest["data-source"]);
            const rawPassage = rest["data-passage"];
            const passage =
                rawPassage === undefined ? null : Number(rawPassage);

            if (!onCitationSelect || Number.isNaN(source)) {
                return (
                    <sup
                        className="ml-0.5 font-mono text-[0.625rem] font-semibold text-brand"
                        {...rest}
                    >
                        {children}
                    </sup>
                );
            }

            return (
                <sup className="ml-0.5">
                    <button
                        type="button"
                        onClick={() => onCitationSelect(source, passage)}
                        aria-label={`Read the passage behind citation ${source}`}
                        data-source={source}
                        data-passage={passage ?? undefined}
                        className="cursor-pointer rounded-sm font-mono text-[0.625rem] font-semibold text-brand underline-offset-2 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                        {children}
                    </button>
                </sup>
            );
        },
    };
}

function AnswerMarkdown({
    children,
    onCitationSelect,
}: {
    children: string;
    onCitationSelect?: (source: number, passage: number | null) => void;
}) {
    const components = React.useMemo(
        () => createComponents(onCitationSelect),
        [onCitationSelect],
    );

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeCitations]}
            components={components}
        >
            {children}
        </ReactMarkdown>
    );
}

export { AnswerMarkdown };
