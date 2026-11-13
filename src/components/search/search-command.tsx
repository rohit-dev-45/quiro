"use client";

import {
    chatQuestionHref,
    chatRoute,
    CHATS_ROUTE,
    ChatSummary,
    LibraryDocumentView,
} from "@/lib/chat";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
    FileTextIcon,
    MessageSquareIcon,
    PlusIcon,
    SearchIcon,
} from "lucide-react";
import { Kbd } from "../ui/kbd";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
} from "../ui/command";

type SearchData = {
    chats: ChatSummary[];
    documents: LibraryDocumentView[];
};

const STATUS_LABEL: Record<LibraryDocumentView["status"], string> = {
    READY: "indexed",
    PROCESSING: "indexing…",
    FAILED: "unreadable",
};

const groupHeading =
    "p-0 **:[[cmdk-group-heading]]:px-4 **:[[cmdk-group-heading]]:pt-4 **:[[cmdk-group-heading]]:pb-2 **:[[cmdk-group-heading]]:text-[0.6875rem] **:[[cmdk-group-heading]]:font-bold **:[[cmdk-group-heading]]:tracking-[0.08em] **:[[cmdk-group-heading]]:uppercase";

const row = "cursor-pointer gap-3 rounded-none! px-4 py-3";

function SearchCommand({ className }: { className?: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [data, setData] = useState<SearchData>({
        chats: [],
        documents: [],
    });

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "k" || !(event.metaKey || event.ctrlKey)) return;

            event.preventDefault();
            setOpen((current) => !current);
        };

        document.addEventListener("keydown", onKeyDown);

        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    useEffect(() => {
        if (!open) return;

        let cancelled = false;

        void (async () => {
            const response = await fetch("/api/search");
            if (!response.ok || cancelled) return;

            setData((await response.json()) as SearchData);
        })();

        return () => {
            cancelled = true;
        };
    }, [open]);

    function go(href: string) {
        setOpen(false);
        setQuery("");
        router.push(href);
    }

    const newestChat = data.chats[0];
    const trimmedQuery = query.trim();

    return (
        <>
            <Button
                variant="outline"
                size="lg"
                onClick={() => setOpen(true)}
                className={cn(
                    "w-64 cursor-pointer justify-start gap-2.5 pr-1.5 pl-2.5 font-normal",
                    className,
                )}
            >
                <SearchIcon className="text-muted-foreground" />
                <span className="text-muted-foreground">Search Or Ask…</span>
                <Kbd className="ml-auto">⌘K</Kbd>
            </Button>

            <CommandDialog
                open={open}
                onOpenChange={(next) => {
                    if (!next) setQuery("");
                    setOpen(next);
                }}
                title="Search"
                description="Search Your Chats And Documents, Or Ask a Question."
                className="top-28 sm:max-w-xl"
            >
                <Command
                    shouldFilter
                    className="gap-0 p-0 **:data-[slot=command-input-wrapper]:border-b **:data-[slot=command-input-wrapper]:p-0 **:data-[slot=input-group]:h-14! **:data-[slot=input-group]:rounded-none! **:data-[slot=input-group]:border-0 **:data-[slot=input-group]:bg-transparent **:data-[slot=input-group]:px-3"
                >
                    <div className="relative">
                        <CommandInput
                            value={query}
                            onValueChange={setQuery}
                            placeholder="Search Or Ask Across Your Documents…"
                        />
                        <Kbd className="absolute top-1/2 right-4 -translate-y-1/2 border bg-background">
                            ESC
                        </Kbd>
                    </div>

                    <CommandList className="max-h-96">
                        <CommandEmpty>Nothing Matches That.</CommandEmpty>

                        {trimmedQuery && newestChat && (
                            <CommandGroup
                                heading="Ask Docsy"
                                className={groupHeading}
                            >
                                <CommandItem
                                    value={`Ask ${trimmedQuery}`}
                                    onSelect={() =>
                                        go(
                                            chatQuestionHref(
                                                newestChat.id,
                                                trimmedQuery,
                                            ),
                                        )
                                    }
                                    className={row}
                                >
                                    <MessageSquareIcon className="text-brand" />
                                    <span className="min-w-0 flex-1 truncate">
                                        {trimmedQuery}
                                    </span>
                                    <CommandShortcut className="tracking-normal">
                                        In {newestChat.title}
                                    </CommandShortcut>
                                </CommandItem>
                            </CommandGroup>
                        )}

                        {data.chats.length > 0 && (
                            <CommandGroup
                                heading="Chats"
                                className={groupHeading}
                            >
                                {data.chats.map((chat) => (
                                    <CommandItem
                                        key={chat.id}
                                        value={`chat ${chat.title}`}
                                        onSelect={() => go(chatRoute(chat.id))}
                                        className={row}
                                    >
                                        <MessageSquareIcon className="text-muted-foreground" />
                                        <span className="min-w-0 flex-1 truncate">
                                            {chat.title}
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {data.documents.length > 0 && (
                            <CommandGroup
                                heading="Jump To"
                                className={groupHeading}
                            >
                                {data.documents.map((document) => (
                                    <CommandItem
                                        key={document.id}
                                        value={`document ${document.name}`}
                                        onSelect={() =>
                                            go(`/api/documents/${document.id}`)
                                        }
                                        className={row}
                                    >
                                        <FileTextIcon className="text-muted-foreground" />
                                        <span className="min-w-0 flex-1 truncate">
                                            {document.name}
                                        </span>
                                        <CommandShortcut className="tracking-normal">
                                            {STATUS_LABEL[document.status]}
                                        </CommandShortcut>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        <CommandGroup
                            heading="Actions"
                            className={groupHeading}
                        >
                            <CommandItem
                                value="New Chat Start"
                                onSelect={() => go(CHATS_ROUTE)}
                                className={row}
                            >
                                <PlusIcon className="text-muted-foreground" />
                                <span className="flex-1">Start a New Chat</span>
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>

                    <div className="flex items-center gap-4 border-t px-4 py-2.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <span aria-hidden className="font-mono">
                                ↑↓
                            </span>
                            Navigate
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span aria-hidden className="font-mono">
                                ↵
                            </span>
                            Select
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span aria-hidden className="font-mono">
                                ESC
                            </span>
                            Close
                        </span>
                    </div>
                </Command>
            </CommandDialog>
        </>
    );
}

export { SearchCommand };
