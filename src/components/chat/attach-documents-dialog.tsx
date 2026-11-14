"use client";

import { LibraryDocumentView, MAX_DOCUMENTS_PER_CHAT } from "@/lib/chat";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "../ui/toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { DocumentDropzone } from "./document-dropzone";
import { Marker, MarkerContent } from "../ui/marker";
import { Button } from "../ui/button";
import { LibraryIcon } from "lucide-react";
import { LibraryPickerDialog } from "./library-picker-dialog";

function AttachDocumentsDialog({
    chatId,
    attachedIds,
    open,
    onOpenChange,
}: {
    chatId: string;
    attachedIds: string[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const router = useRouter();
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [library, setLibrary] = useState<LibraryDocumentView[]>([]);

    useEffect(() => {
        if (!open) return;

        let cancelled = false;

        void (async () => {
            const response = await fetch("/api/documents");
            if (!response.ok || cancelled) return;

            setLibrary((await response.json()) as LibraryDocumentView[]);
        })();

        return () => {
            cancelled = true;
        };
    }, [open]);

    async function attach(documentIds: string[]) {
        setBusy("Attaching To This Chat…");

        const response = await fetch(`/api/chats/${chatId}/documents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentIds }),
        });

        if (!response.ok) {
            const detail = await response.json().catch(() => null);
            setError(detail?.error ?? "Couldn't Attach Those Documents.");
            setBusy(null);
            return;
        }

        const { attached } = (await response.json()) as { attached: number };

        toast.add({
            title:
                attached === 0
                    ? "Already Attached To This Chat."
                    : `${attached} Document${attached === 1 ? "" : "s"} Attached.`,
            description:
                attached === 0
                    ? undefined
                    : "Your Next Question Will Be Answered From Them Too.",
        });

        setBusy(null);
        onOpenChange(false);
        router.refresh();
    }

    async function upload(files: File[]) {
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

        await attach(uploaded);
    }

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(next) => {
                    if (busy) return;
                    setError(null);
                    onOpenChange(next);
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Attach Documents</DialogTitle>
                        <DialogDescription>
                            They Join This Chat As Sources, And Stay In Your
                            Library For The Next One.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertTitle>That Didn&apos;t Work</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <DocumentDropzone
                            busy={busy}
                            onFiles={(files) => void upload(files)}
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
                            disabled={busy !== null}
                            onClick={() => {
                                setError(null);
                                onOpenChange(false);
                                setIsLibraryOpen(true);
                            }}
                        >
                            <LibraryIcon />
                            Choose From Library
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <LibraryPickerDialog
                open={isLibraryOpen}
                onOpenChange={setIsLibraryOpen}
                documents={library}
                addedIds={attachedIds}
                onAdd={(picked) => {
                    setError(null);
                    void attach(picked.map((document) => document.id));
                }}
            />
        </>
    );
}

export { AttachDocumentsDialog };
