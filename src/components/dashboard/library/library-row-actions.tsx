"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { chatRoute } from "@/lib/chat";
import { LibraryRowView } from "@/lib/library";
import {
    ExternalLinkIcon,
    MessageSquarePlusIcon,
    MoreVerticalIcon,
    Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function chatsLabel(count: number) {
    return `${count} chat${count === 1 ? "" : "s"}`;
}

function LibraryRowActions({ document }: { document: LibraryRowView }) {
    const router = useRouter();
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isStartingChat, setIsStartingChat] = useState(false);

    async function startChat() {
        setIsStartingChat(true);

        try {
            const response = await fetch("/api/chats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentIds: [document.id] }),
            });

            if (!response.ok) {
                const detail = await response.json().catch(() => null);

                toast.add({
                    title: "Couldn't Start That Chat.",
                    description: detail?.error ?? "Try Again In a Moment.",
                });
                return;
            }

            const chat = (await response.json()) as { id: string };
            router.push(chatRoute(chat.id));
        } catch {
            toast.add({
                title: "Couldn't Start That Chat.",
                description: "Check Your Connection And Try Again.",
            });
        } finally {
            setIsStartingChat(false);
        }
    }

    async function confirmDelete() {
        setIsDeleting(true);

        try {
            const response = await fetch(`/api/documents/${document.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const detail = await response.json().catch(() => null);

                toast.add({
                    title: "Couldn't Delete That Document.",
                    description: detail?.error ?? "Try Again In a Moment.",
                });
                return;
            }

            toast.add({
                title: `Deleted "${document.name}".`,
                description:
                    document.chatCount > 0
                        ? `Removed As a Source From ${chatsLabel(document.chatCount)}.`
                        : "Removed From Your Library.",
            });

            setIsConfirmingDelete(false);
            router.refresh();
        } catch {
            toast.add({
                title: "Couldn't Delete That Document.",
                description: "Check Your Connection And Try Again.",
            });
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer text-muted-foreground"
                            aria-label={`Actions for ${document.name}`}
                        >
                            <MoreVerticalIcon />
                        </Button>
                    }
                />

                <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem
                        className="cursor-pointer"
                        render={
                            <a
                                href={`/api/documents/${document.id}`}
                                target="_blank"
                                rel="noreferrer noopener"
                            />
                        }
                    >
                        <ExternalLinkIcon />
                        Open Document
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        className="cursor-pointer"
                        disabled={document.status !== "READY" || isStartingChat}
                        onClick={startChat}
                    >
                        {isStartingChat ? (
                            <Spinner />
                        ) : (
                            <MessageSquarePlusIcon />
                        )}
                        Start a Chat
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={() => setIsConfirmingDelete(true)}
                    >
                        <Trash2Icon />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog
                open={isConfirmingDelete}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) setIsConfirmingDelete(false);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete This Document?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            &ldquo;{document.name}&rdquo; Will Be Removed From
                            Your Library And Can&apos;t Be Recovered.
                            {document.chatCount > 0
                                ? ` ${chatsLabel(document.chatCount)} Cite It — Those Answers Stay, But The Passages Behind Them Will No Longer Open.`
                                : " No Chat Is Using It."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={confirmDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {isDeleting && <Spinner data-icon="inline-start" />}
                            Delete Document
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export { LibraryRowActions };
