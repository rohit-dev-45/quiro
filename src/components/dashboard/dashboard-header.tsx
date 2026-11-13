"use client";

import { ADMIN_BADGE, isAdminRoute } from "@/lib/admin";
import { SessionUser } from "@/lib/auth-client";
import { dashboardPageTitle, SETTINGS_ROUTE } from "@/lib/dashboard-nav";
import { SettingsIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "../ui/sidebar";
import { Badge } from "../ui/badge";
import { SEARCH_ROUTE } from "@/lib/search";
import { SearchCommand } from "../search/search-command";
import { ThemeToggle } from "../theme-toggle";
import { AccountMenu } from "./account-menu";
import { Button } from "../ui/button";
import { UserAvatar } from "../auth/user-avatar";

const accountMenuItems = [
    { href: SETTINGS_ROUTE, label: "Manage Account", icon: SettingsIcon },
];

function DashboardHeader({
    user,
    title,
    badge,
    showSearch = true,
    showSidebarTrigger = false,
}: {
    user: SessionUser;
    title?: string;
    badge?: string;
    showSearch?: boolean;
    showSidebarTrigger?: boolean;
}) {
    const pathname = usePathname();
    const pill = badge ?? (isAdminRoute(pathname) ? ADMIN_BADGE : undefined);

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-6">
            {showSidebarTrigger && (
                <SidebarTrigger className="-ml-2 cursor-pointer md:hidden" />
            )}

            <h1 className="truncate text-base font-semibold">
                {title ?? dashboardPageTitle(pathname)}
            </h1>

            {pill && (
                <Badge className="shrink-0 bg-brand/15 font-mono text-[0.625rem] font-bold tracking-wider text-brand uppercase">
                    {pill}
                </Badge>
            )}

            <div className="ml-auto flex shrink-0 items-center gap-2">
                {showSearch && pathname !== SEARCH_ROUTE && (
                    <SearchCommand className="hidden w-44 sm:inline-flex lg:w-64" />
                )}
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

export { DashboardHeader };
