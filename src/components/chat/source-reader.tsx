"use client";

import { ChatSource } from "@/lib/chat";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ExternalLinkIcon, FileTextIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

export type ActiveCitation = {
    source: ChatSource;
    passage: number | null;
};

function ContextPlaceholder({ lines }: { lines: number[] }) {
    return (
        <div className="flex flex-col gap-2" aria-hidden="true">
            {lines.map((width, index) => (
                <Skeleton
                    key={index}
                    className="h-2.5 rounded-full"
                    style={{ width: `${width}%` }}
                />
            ))}
        </div>
    );
}

function Passage({
    passage,
    isActive,
}: {
    passage: ChatSource["passages"][number];
    isActive: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isActive) return;

        ref.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, [isActive]);

    return (
        <div ref={ref} className="flex flex-col gap-3">
            {passage.before ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                    …{passage.before}
                </p>
            ) : (
                <ContextPlaceholder lines={[100, 92, 78]} />
            )}

            <blockquote
                className={cn(
                    "border-s-[3px] px-4 py-3 text-sm leading-relaxed transition-colors",
                    isActive
                        ? "border-brand bg-brand/10 text-foreground"
                        : "border-border bg-surface text-muted-foreground",
                )}
            >
                {passage.text}
            </blockquote>

            {passage.after ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {passage.after}…
                </p>
            ) : (
                <ContextPlaceholder lines={[100, 88, 95, 70, 60]} />
            )}
        </div>
    );
}

function ReaderBody({ citation }: { citation: ActiveCitation | null }) {
    const source = citation?.source ?? null;

    if (!source) {
        return (
            <div className="flex flex-1 items-center justify-center px-6 text-center">
                <p className="text-sm text-balance text-muted-foreground">
                    Select a Citation In An Answer To Read The Passage It Came
                    From.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="flex shrink-0 items-center gap-2.5 border-b px-4 py-3.5">
                <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {source.document}
                </span>
                {source.page !== null && (
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        p.{source.page}
                    </span>
                )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {source.passages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        This Answer Was Written Before Quiro Started Keeping The
                        Quoted Passages. Ask The Question Again To See Them
                        Here.
                    </p>
                ) : (
                    <div className="flex flex-col gap-6">
                        {source.passages.map((passage, index) => (
                            <Passage
                                key={`${source.index}-${index}`}
                                passage={passage}
                                isActive={index === (citation?.passage ?? 0)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {source.documentId && (
                <div className="shrink-0 border-t p-4">
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full cursor-pointer"
                        render={
                            <a
                                href={`/api/documents/${source.documentId}`}
                                target="_blank"
                                rel="noreferrer noopener"
                            />
                        }
                        nativeButton={false}
                    >
                        <ExternalLinkIcon />
                        Open Full Document
                    </Button>
                </div>
            )}
        </>
    );
}

function ReaderHeading({ source }: { source: ChatSource | null }) {
    return (
        <>
            <span className="text-[0.6875rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
                Source Reader
            </span>

            {source && (
                <Badge
                    variant="outline"
                    className="ml-auto rounded-md border-brand/40 font-mono text-[0.625rem] font-semibold tracking-wider text-brand"
                >
                    [{source.index}]
                </Badge>
            )}
        </>
    );
}

function SourceReader({
    citation,
    onDismiss,
}: {
    citation: ActiveCitation | null;
    onDismiss: () => void;
}) {
    const isDocked = useMediaQuery("(min-width: 80rem)");

    if (isDocked) {
        return (
            <aside className="hidden w-96 shrink-0 flex-col border-s bg-background xl:flex">
                <div className="flex h-12 shrink-0 items-center gap-3 border-b px-4">
                    <ReaderHeading source={citation?.source ?? null} />
                </div>

                <ReaderBody citation={citation} />
            </aside>
        );
    }

    return (
        <Sheet
            open={citation !== null}
            onOpenChange={(open) => {
                if (!open) onDismiss();
            }}
        >
            <SheetContent
                side="right"
                className="flex w-full flex-col p-0 sm:max-w-96"
            >
                <SheetHeader className="h-12 shrink-0 flex-row items-center gap-3 border-b px-4">
                    <SheetTitle className="contents">
                        <ReaderHeading source={citation?.source ?? null} />
                    </SheetTitle>
                </SheetHeader>

                <ReaderBody citation={citation} />
            </SheetContent>
        </Sheet>
    );
}

export { SourceReader };
