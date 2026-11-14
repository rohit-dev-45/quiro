import { QuiroMark } from "@/components/brand/docsy-logo";
import { chatQuestionHref, CHATS_ROUTE } from "@/lib/chat";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

function askHref(query: string, chatId: string | null) {
    return chatId
        ? chatQuestionHref(chatId, query, { autoAsk: true })
        : CHATS_ROUTE;
}

function SearchAskCard({
    query,
    chatId,
}: {
    query: string;
    chatId: string | null;
}) {
    return (
        <Link
            href={askHref(query, chatId)}
            className="group flex items-center gap-4 rounded-xl border border-dashed bg-surface px-5 py-4 transition-colors hover:border-brand/50 hover:bg-accent/40"
        >
            <QuiroMark className="size-10 shrink-0" />

            <span className="min-w-0 flex-1">
                <span className="block font-semibold">
                    Ask Quiro Instead Of Scanning Results
                </span>
                <span className="block truncate text-sm text-muted-foreground">
                    Get One Cited Answer Synthesized From These Passages.
                </span>
            </span>

            <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
    );
}

export { askHref, SearchAskCard };
