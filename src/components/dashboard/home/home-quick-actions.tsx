import { CHATS_ROUTE } from "@/lib/chat";
import { PlusIcon, UploadIcon } from "lucide-react";
import Link from "next/link";

function HomeQuickActions() {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <Link
                href={CHATS_ROUTE}
                className="flex cursor-pointer items-center gap-4 rounded-xl border bg-card p-5 text-left transition-colors hover:bg-accent/50"
            >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <PlusIcon className="size-5" />
                </span>
                <span className="flex min-w-0 flex-col">
                    <span className="font-semibold">Start a New Chat</span>
                    <span className="truncate text-sm text-muted-foreground">
                        Ask Across Your Library
                    </span>
                </span>
            </Link>

            <Link
                href={CHATS_ROUTE}
                className="group flex cursor-pointer items-center gap-4 rounded-xl border border-dashed bg-surface p-5 text-left transition-colors hover:border-brand"
            >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-brand">
                    <UploadIcon className="size-5" />
                </span>
                <span className="flex min-w-0 flex-col">
                    <span className="font-semibold">Upload Documents</span>
                    <span className="truncate text-sm text-muted-foreground">
                        PDF, Word, Slides, Scans
                    </span>
                </span>
            </Link>
        </div>
    );
}

export { HomeQuickActions };
