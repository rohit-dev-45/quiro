"use client";

import {
    chatRoute,
    LibraryDocumentView,
    MAX_DOCUMENTS_PER_CHAT,
} from "@/lib/chat";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "../ui/empty";
import { QuiroMark } from "../brand/docsy-logo";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { DocumentDropzone } from "./document-dropzone";
import { Marker, MarkerContent } from "../ui/marker";
import { Button } from "../ui/button";
import { LibraryIcon } from "lucide-react";
import { ChatComposer } from "./chat-composer";
import { LibraryPickerDialog } from "./library-picker-dialog";

function NewChatPanel({ documents }: { documents: LibraryDocumentView[] }) {
    const router = useRouter();
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function startChat(documentIds: string[]) {
        setBusy("Opening The Chat…");

        const response = await fetch("/api/chats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentIds }),
        });

        if (!response.ok) {
            const detail = await response.json().catch(() => null);
            setError(detail?.error ?? "Couldn't Start That Chat.");
            setBusy(null);
            return;
        }

        const chat = (await response.json()) as { id: string };

        router.push(chatRoute(chat.id));
    }

    async function uploadAndStart(files: File[]) {
        if (files.length === 0) return;

        setError(null);
        const uploaded: string[] = [];

        for (const [index, file] of files
            .slice(0, MAX_DOCUMENTS_PER_CHAT)
            .entries()) {
            setBusy(
                files.length > 1
                    ? `Reading ${file.name} (${index + 1} Of ${files.length})…`
                    : `Reading ${file.name}…`,
            );

            const form = new FormData();
            form.append("file", file);

            const response = await fetch("/api/documents", {
                method: "POST",
                body: form,
            });

            if (!response.ok) {
                const detail = await response.json().catch(() => null);
                setError(detail?.error ?? `Couldn't Read ${file.name}.`);
                setBusy(null);
                return;
            }

            const document = (await response.json()) as LibraryDocumentView;
            uploaded.push(document.id);
        }

        await startChat(uploaded);
    }

    const isBusy = busy !== null;

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-10">
                <Empty className="max-w-xl p-0">
                    <EmptyHeader className="max-w-lg">
                        <EmptyMedia>
                            <QuiroMark className="size-12" />
                        </EmptyMedia>

                        <EmptyTitle className="text-2xl font-bold">
                            Add Documents To Start
                        </EmptyTitle>

                        <EmptyDescription>
                            Quiro Only Answers From Sources You Provide, With A
                            Citation For Every Claim. Attach At Least One
                            Document To Begin This Chat.
                        </EmptyDescription>
                    </EmptyHeader>

                    <EmptyContent className="max-w-none gap-4">
                        {error && (
                            <Alert variant="destructive" className="text-left">
                                <AlertTitle>That Didn&apos;t Work</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <DocumentDropzone
                            busy={busy}
                            onFiles={(files) => void uploadAndStart(files)}
                        />

                        <Marker variant="separator">
                            <MarkerContent className="text-xs">
                                OR
                            </MarkerContent>
                        </Marker>

                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full cursor-pointer"
                            disabled={isBusy}
                            onClick={() => setIsLibraryOpen(true)}
                        >
                            <LibraryIcon />
                            Choose From Library
                        </Button>
                    </EmptyContent>
                </Empty>
            </div>

            <div className="shrink-0 px-6 pb-6">
                <div className="mx-auto w-full max-w-3xl">
                    <ChatComposer
                        disabled
                        placeholder="Add a Document To Ask Your First Question…"
                    />
                </div>
            </div>

            <LibraryPickerDialog
                open={isLibraryOpen}
                onOpenChange={setIsLibraryOpen}
                documents={documents}
                addedIds={[]}
                onAdd={(picked) => {
                    setError(null);
                    void startChat(picked.map((document) => document.id));
                }}
            />
        </div>
    );
}

export { NewChatPanel };
