"use client";

import { SessionUser } from "@/lib/auth-client";
import { chatRoute, CHATS_ROUTE, ChatSummary } from "@/lib/chat";
import { APP_ROOT, BILLING_ROUTE, SETTINGS_ROUTE } from "@/lib/dashboard-nav";
import {
    ChevronsUpDownIcon,
    CreditCardIcon,
    HouseIcon,
    PlusIcon,
    Trash2Icon,
    UserIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "../ui/toast";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "../ui/sidebar";
import Link from "next/link";
import { QuiroLogo } from "../brand/docsy-logo";
import { Button } from "../ui/button";
import { AccountMenu } from "../dashboard/account-menu";
import { UserAvatar } from "../auth/user-avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";
import { Spinner } from "../ui/spinner";

const accountMenuItems = [
    { href: SETTINGS_ROUTE, label: "Account", icon: UserIcon },
    { href: BILLING_ROUTE, label: "Billing", icon: CreditCardIcon },
];

function ChatSidebar({
    user,
    chats,
    planLabel,
}: {
    user: SessionUser;
    chats: ChatSummary[];
    planLabel: string;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const [pendingDelete, setPendingDelete] = useState<ChatSummary | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    async function confirmDelete() {
        if (!pendingDelete) return;

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/chats/${pendingDelete.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const detail = await response.json().catch(() => null);
                toast.add({
                    title: "Couldn't Delete That Chat.",
                    description: detail?.error ?? "Try Again In a Moment.",
                });
                return;
            }

            const { deletedDocuments, keptSharedDocuments } =
                (await response.json()) as {
                    deletedDocuments: number;
                    keptSharedDocuments: number;
                };

            toast.add({
                title: `Deleted "${pendingDelete.title}".`,
                description:
                    keptSharedDocuments > 0
                        ? `${deletedDocuments} Document${deletedDocuments === 1 ? "" : "s"} Removed. ${keptSharedDocuments} Kept — Still Used By Another Chat.`
                        : `${deletedDocuments} Document${deletedDocuments === 1 ? "" : "s"} Removed From Your Library.`,
            });

            if (pathname === chatRoute(pendingDelete.id)) {
                router.push(CHATS_ROUTE);
            }

            setPendingDelete(null);
            router.refresh();
        } catch {
            toast.add({
                title: "Couldn't Delete That Chat.",
                description: "Check Your Connection And Try Again.",
            });
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Sidebar>
            <SidebarHeader className="gap-4 px-3 pt-4 pb-2">
                <Link href={APP_ROOT} aria-label="Docsy home" className="px-1">
                    <QuiroLogo />
                </Link>

                <Button
                    size="lg"
                    className="w-full cursor-pointer"
                    render={<Link href={CHATS_ROUTE} />}
                    nativeButton={false}
                >
                    <PlusIcon />
                    New Chat
                </Button>
            </SidebarHeader>

            <SidebarContent className="gap-1">
                <SidebarGroup className="px-3 py-0">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    render={<Link href={APP_ROOT} />}
                                    className="h-9 gap-3 px-2.5 text-muted-foreground"
                                >
                                    <HouseIcon />
                                    <span>Home</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="gap-1 px-3 py-0">
                    <SidebarGroupLabel className="mt-3 px-2 text-[0.6875rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
                        Recent Chats
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        {chats.length === 0 ? (
                            <p className="px-2.5 py-1.5 text-sm text-muted-foreground">
                                Nothing Yet. Add a Document To Start Your First
                                Chat.
                            </p>
                        ) : (
                            <SidebarMenu className="gap-1">
                                {chats.map((chat) => {
                                    const href = chatRoute(chat.id);

                                    return (
                                        <SidebarMenuItem key={chat.id}>
                                            <SidebarMenuButton
                                                render={<Link href={href} />}
                                                isActive={pathname === href}
                                                className="h-9 px-2.5 pr-8 text-muted-foreground data-active:font-semibold data-active:text-sidebar-accent-foreground"
                                            >
                                                <span>{chat.title}</span>
                                            </SidebarMenuButton>

                                            <SidebarMenuAction
                                                showOnHover
                                                aria-label={`Delete ${chat.title}`}
                                                className="top-2.5 cursor-pointer hover:text-destructive"
                                                onClick={() =>
                                                    setPendingDelete(chat)
                                                }
                                            >
                                                <Trash2Icon />
                                            </SidebarMenuAction>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        )}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <AccountMenu
                            user={user}
                            items={accountMenuItems}
                            side="top"
                            align="start"
                            className="w-(--sidebar-width)"
                            render={
                                <SidebarMenuButton
                                    size="lg"
                                    className="cursor-pointer gap-3"
                                    aria-label="Account menu"
                                />
                            }
                        >
                            <UserAvatar user={user} className="size-9" />
                            <div className="flex min-w-0 flex-1 flex-col text-left">
                                <span className="truncate text-sm font-semibold">
                                    {user.name || user.email}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {planLabel}
                                </span>
                            </div>
                            <ChevronsUpDownIcon className="text-muted-foreground" />
                        </AccountMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />

            <AlertDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) setPendingDelete(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete This Chat?</AlertDialogTitle>
                        <AlertDialogDescription>
                            &ldquo;{pendingDelete?.title}&rdquo; And Its Answers
                            Will Be Deleted, Along With The Documents Behind It.
                            Any Document Another Chat Is Still Using Stays In
                            Your Library. This Can't Be Undone.
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
                            Delete Chat
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Sidebar>
    );
}

export { ChatSidebar };
