"use client";

import { SessionUser } from "@/lib/auth-client";
import { SETTINGS_ROUTE } from "@/lib/dashboard-nav";
import { LayersIcon, SettingsIcon } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import { Badge } from "../ui/badge";
import { ThemeToggle } from "../theme-toggle";
import { AccountMenu } from "../dashboard/account-menu";
import { Button } from "../ui/button";
import { UserAvatar } from "../auth/user-avatar";

const accountMenuItems = [
    { href: SETTINGS_ROUTE, label: "Manage Account", icon: SettingsIcon },
];

function ChatHeader({
    user,
    title,
    documentCount,
}: {
    user: SessionUser;
    title: string;
    documentCount?: number;
}) {
    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-6">
            <SidebarTrigger className="-ml-2 cursor-pointer md:hidden" />

            <h1 className="truncate text-base font-semibold">{title}</h1>

            {documentCount ? (
                <Badge
                    variant="secondary"
                    className="shrink-0 gap-1.5 rounded-full text-muted-foreground"
                >
                    <LayersIcon className="size-3.5" />
                    {documentCount} {documentCount === 1 ? "Doc" : "Docs"}
                </Badge>
            ) : null}

            <div className="ml-auto flex items-center gap-2">
                <ThemeToggle className="size-9" />

                <AccountMenu
                    user={user}
                    items={accountMenuItems}
                    align="end"
                    render={
                        <Button
                            variant="ghost"
                            size="icon-lg"
                            className="cursor-pointer rounded-full"
                            aria-label="Account menu"
                        />
                    }
                >
                    <UserAvatar user={user} className="size-9" />
                </AccountMenu>
            </div>
        </header>
    );
}

export { ChatHeader };
