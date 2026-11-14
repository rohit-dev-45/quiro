"use client";

import { authErrorMessage } from "@/components/auth/auth-errors";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { DashboardNavCounts } from "@/lib/dashboard-nav";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ActionId = "clear-history" | "clear-library" | "delete-account";

function plural(count: number, noun: string) {
    return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

async function clearAll(path: string) {
    const response = await fetch(path, { method: "DELETE" });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(body?.error ?? "Try Again In a Moment.");
    }

    return body as { chats?: number; documents?: number };
}

function DangerZoneSettings({
    counts,
    hasPassword,
}: {
    counts: DashboardNavCounts;
    hasPassword: boolean;
}) {
    const router = useRouter();

    const [confirming, setConfirming] = useState<ActionId | null>(null);
    const [running, setRunning] = useState(false);
    const [password, setPassword] = useState("");

    function open(id: ActionId) {
        setPassword("");
        setConfirming(id);
    }

    async function clearHistory() {
        const { chats = 0 } = await clearAll("/api/chats");

        toast.add({
            type: "success",
            title: `Deleted ${plural(chats, "Chat")}.`,
            description: "Your Documents Are Still In The Library.",
        });

        router.refresh();
    }

    async function clearLibrary() {
        const { documents = 0 } = await clearAll("/api/documents");

        toast.add({
            type: "success",
            title: `Deleted ${plural(documents, "Document")}.`,
            description:
                "Chats Keep Their Answers, But No Longer Open The Sources.",
        });

        router.refresh();
    }

    async function deleteAccount() {
        const { error } = await authClient.deleteUser(
            hasPassword ? { password } : {},
        );

        if (error) {
            throw new Error(
                authErrorMessage(error, "Check Your Password And Try Again."),
            );
        }

        toast.add({
            type: "success",
            title: "Your Account Has Been Deleted.",
            description: "Everything In Your Workspace Has Been Removed.",
        });

        router.replace("/");
        router.refresh();
    }

    const ACTIONS = [
        {
            id: "clear-history" as const,
            title: "Clear Chat History",
            description:
                "Delete Every Conversation. Your Documents Stay Indexed.",
            action: "Clear History",
            destructive: false,
            disabled: counts.chats === 0,
            confirm: {
                title: "Clear Your Chat History?",
                body: `All ${plural(counts.chats, "chat")} In This Workspace Will Be Deleted Along With Their Answers, And Can't Be Recovered. Your Documents Stay In The Library.`,
                button: "Clear History",
                run: clearHistory,
                failure: "Couldn't Clear Your Chat History.",
            },
        },
        {
            id: "clear-library" as const,
            title: "Clear All Documents",
            description:
                "Delete Every Document And Its Embeddings From Your Library.",
            action: "Clear Library",
            destructive: false,
            disabled: counts.documents === 0,
            confirm: {
                title: "Clear Your Library?",
                body: `All ${plural(counts.documents, "document")} Will Be Removed And Can't Be Recovered. Chats Keep The Answers Already Written, But The Passages Behind Them Will No Longer Open.`,
                button: "Clear Library",
                run: clearLibrary,
                failure: "Couldn't Clear Your Library.",
            },
        },
        {
            id: "delete-account" as const,
            title: "Delete Account",
            description:
                "Permanently Remove Your Account, Documents, And Chat History.",
            action: "Delete Account",
            destructive: true,
            disabled: false,
            confirm: {
                title: "Delete Your Account?",
                body: `Your Account, This Workspace, ${plural(counts.chats, "chat")} And ${plural(counts.documents, "document")} Will Be Permanently Deleted. This Can't Be Undone.`,
                button: "Delete Account",
                run: deleteAccount,
                failure: "Couldn't Delete Your Account.",
            },
        },
    ];

    const pending = ACTIONS.find((item) => item.id === confirming);

    const canConfirm =
        pending?.id !== "delete-account" || !hasPassword || password.length > 0;

    async function confirm() {
        if (!pending || !canConfirm) return;

        setRunning(true);

        try {
            await pending.confirm.run();
            setConfirming(null);
        } catch (error) {
            toast.add({
                type: "error",
                title: pending.confirm.failure,
                description:
                    error instanceof Error
                        ? error.message
                        : "Check Your Connection And Try Again.",
            });
        } finally {
            setRunning(false);
        }
    }

    return (
        <div className="overflow-hidden rounded-xl border border-destructive/50">
            <div className="bg-destructive/5 p-6">
                <h2 className="font-heading text-lg font-semibold text-destructive">
                    Danger Zone
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    These Actions Are Permanent And Cannot Be Undone.
                </p>
            </div>

            <div className="divide-y border-t border-destructive/50">
                {ACTIONS.map((item) => (
                    <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-4 p-6"
                    >
                        <div>
                            <p className="font-semibold">{item.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {item.description}
                            </p>
                        </div>

                        {item.destructive ? (
                            <Button
                                size="lg"
                                className="cursor-pointer bg-destructive px-4 text-white hover:bg-destructive/90"
                                onClick={() => open(item.id)}
                            >
                                {item.action}
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="lg"
                                disabled={item.disabled}
                                className="cursor-pointer border-destructive/50 px-4 text-destructive hover:bg-destructive/5 hover:text-destructive"
                                onClick={() => open(item.id)}
                            >
                                {item.action}
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <AlertDialog
                open={pending !== undefined}
                onOpenChange={(open) => {
                    if (!open && !running) setConfirming(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pending?.confirm.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pending?.confirm.body}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {pending?.id === "delete-account" && hasPassword && (
                        <Field>
                            <FieldLabel htmlFor="delete-account-password">
                                Confirm Your Password
                            </FieldLabel>
                            <Input
                                id="delete-account-password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                disabled={running}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") confirm();
                                }}
                            />
                        </Field>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={running}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={running || !canConfirm}
                            onClick={confirm}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {running && <Spinner data-icon="inline-start" />}
                            {pending?.confirm.button}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export { DangerZoneSettings };
