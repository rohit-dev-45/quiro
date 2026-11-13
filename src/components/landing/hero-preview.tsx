import { cn } from "@/lib/utils";
import { CheckIcon, FileIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { QuiroMark } from "../brand/docsy-logo";
import { TypingDots } from "../common/typing-dots";
import { Kbd } from "../ui/kbd";

function DocLine({ className }: { className?: string }) {
    return (
        <div
            aria-hidden
            className={cn("h-1.5 rounded-full bg-muted", className)}
        />
    );
}

function Citation({ index }: { index: number }) {
    return (
        <sup className="ml-0.5 font-mono text-[0.6em] text-brand">
            [{index}]
        </sup>
    );
}

function WindowBar() {
    return (
        <div className="flex items-center gap-3 border-b px-4 py-3">
            <div aria-hidden className="flex gap-1.5">
                <span className="size-2 rounded-full bg-muted-foreground/30" />
                <span className="size-2 rounded-full bg-muted-foreground/30" />
                <span className="size-2 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="flex min-w-0 items-center gap-1.5 font-mono text-xs text-muted-foreground">
                <FileIcon className="size-3.5 shrink-0" />
                <span className="truncate">Q3_Vendor_Agreement.pdf</span>
            </div>
            <Badge
                variant="outline"
                className="ml-auto hidden h-6 rounded-lg font-mono text-[0.625rem] font-normal text-muted-foreground sm:inline-flex"
            >
                3 Docs Indexed
            </Badge>
        </div>
    );
}

function AnswerPane() {
    return (
        <div className="flex flex-col gap-3 border-b p-4 sm:border-r sm:border-b-0">
            <p className="ml-auto max-w-[90%] rounded-xl bg-muted px-3.5 py-2.5 text-sm">
                What&apos;s The Termination Notice Period?
            </p>

            <div className="flex items-center gap-2">
                <QuiroMark className="size-4" />
                <span className="font-mono text-[0.625rem] tracking-[0.18em] text-muted-foreground">
                    QUIRO
                </span>
            </div>

            <p className="text-sm leading-relaxed">
                Either Party May Terminate With{" "}
                <mark className="rounded-sm bg-brand/25 px-0.5 font-semibold text-foreground">
                    60 Days&apos; Written Notice
                </mark>
                <Citation index={1} />, And Immediately For a Material Breach
                That Is Uncured After 30 Days
                <Citation index={2} />.
            </p>

            <p className="flex items-center gap-1.5 text-xs text-brand">
                <CheckIcon className="size-3.5" />
                Verify In Source
            </p>

            <TypingDots />

            <div className="mt-auto flex items-center gap-2 rounded-xl border px-3 py-2.5">
                <span className="truncate text-sm text-muted-foreground">
                    Ask About Your Documents…
                </span>
                <Kbd className="ml-auto">⌘K</Kbd>
            </div>
        </div>
    );
}

function SourcePane() {
    return (
        <div className="flex flex-col gap-2.5 p-4">
            <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[0.625rem] tracking-[0.15em] text-muted-foreground">
                    SOURCE · P.12
                </span>
                <Badge
                    variant="outline"
                    className="rounded-md border-brand font-mono text-[0.625rem] font-normal text-brand"
                >
                    [1]
                </Badge>
            </div>

            <DocLine />
            <DocLine className="w-4/5" />

            <blockquote className="border-l-2 border-brand bg-brand/15 p-3 text-xs leading-relaxed">
                &ldquo;…May Be Terminated By Either Party Upon{" "}
                <strong className="font-semibold">
                    Sixty (60) Days&apos; Prior Written Notice
                </strong>{" "}
                Delivered To The Address Of Record…&rdquo;
            </blockquote>

            <DocLine className="w-11/12" />
            <DocLine className="w-3/4" />
            <DocLine className="w-10/12" />
            <DocLine className="w-1/2" />
        </div>
    );
}

export function HeroPreview({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "overflow-hidden rounded-xl border bg-card shadow-xl",
                className,
            )}
        >
            <WindowBar />
            <div className="grid sm:grid-cols-[1.15fr_1fr]">
                <AnswerPane />
                <SourcePane />
            </div>
        </div>
    );
}
