"use client";

import { SessionUser } from "@/lib/auth-client";
import {
    APP_ROOT,
    BILLING_ROUTE,
    DashboardNavCounts,
    isDashboardNavItemActive,
    SETTINGS_ROUTE,
    visibleDashboardNav,
    workspaceInitials,
} from "@/lib/dashboard-nav";
import {
    ChevronsUpDownIcon,
    CreditCardIcon,
    PlusIcon,
    UserIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "../ui/sidebar";
import Link from "next/link";
import { QuiroLogo } from "../brand/docsy-logo";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { AccountMenu } from "./account-menu";
import { UserAvatar } from "../auth/user-avatar";

const accountMenuItems = [
    { href: SETTINGS_ROUTE, label: "Account", icon: UserIcon },
    { href: BILLING_ROUTE, label: "Billing", icon: CreditCardIcon },
];

function DashboardSidebar({
    user,
    workspaceName,
    counts,
    planLabel,
    isAdmin,
}: {
    user: SessionUser;
    workspaceName: string;
    counts: DashboardNavCounts;
    planLabel: string;
    isAdmin: boolean;
}) {
    const pathname = usePathname();
    const nav = visibleDashboardNav(isAdmin);

    return (
        <Sidebar>
            <SidebarHeader className="gap-4 px-3 pt-4 pb-2">
                <Link href={APP_ROOT} aria-label="Quiro Home" className="px-1">
                    <QuiroLogo />
                </Link>

                <Link href="/app/chats">
                    <Button size="lg" className="w-full cursor-pointer">
                        <PlusIcon />
                        New Chat
                    </Button>
                </Link>
            </SidebarHeader>

            <SidebarContent className="gap-1">
                <div className="flex items-center gap-3 px-5 py-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md border text-[0.625rem] font-semibold tracking-wide">
                        {workspaceInitials(workspaceName)}
                    </span>
                    <span className="truncate text-sm font-semibold">
                        {workspaceName}
                    </span>
                </div>

                {nav.map((group, index) => (
                    <SidebarGroup
                        key={group.title ?? index}
                        className="gap-1 px-3 py-0"
                    >
                        {group.title && (
                            <SidebarGroupLabel className="mt-3 px-2 text-[0.6875rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
                                {group.title}
                            </SidebarGroupLabel>
                        )}

                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1">
                                {group.items.map((item) => {
                                    const isActive = isDashboardNavItemActive(
                                        item,
                                        pathname,
                                    );
                                    const count = item.count
                                        ? counts[item.count]
                                        : 0;

                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                render={
                                                    <Link href={item.href} />
                                                }
                                                isActive={isActive}
                                                className="h-9 gap-3 px-2.5 text-muted-foreground data-active:text-sidebar-accent-foreground"
                                            >
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </SidebarMenuButton>

                                            {count > 0 && (
                                                <SidebarMenuBadge className="top-2 right-2 text-muted-foreground">
                                                    {count}
                                                </SidebarMenuBadge>
                                            )}

                                            {item.tag && (
                                                <Badge className="pointer-events-none absolute top-2 right-2 bg-brand/15 text-[0.625rem] font-bold tracking-wider text-brand uppercase group-data-[collapsible=icon]:hidden">
                                                    {item.tag}
                                                </Badge>
                                            )}

                                            {item.items && isActive && (
                                                <SidebarMenuSub className="my-1 gap-0.5">
                                                    {item.items.map(
                                                        (subItem) => (
                                                            <SidebarMenuSubItem
                                                                key={
                                                                    subItem.href
                                                                }
                                                            >
                                                                <SidebarMenuSubButton
                                                                    render={
                                                                        <Link
                                                                            href={
                                                                                subItem.href
                                                                            }
                                                                        />
                                                                    }
                                                                    isActive={
                                                                        pathname ===
                                                                        subItem.href
                                                                    }
                                                                    className="text-muted-foreground data-active:font-medium"
                                                                >
                                                                    <span>
                                                                        {
                                                                            subItem.label
                                                                        }
                                                                    </span>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ),
                                                    )}
                                                </SidebarMenuSub>
                                            )}
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
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
        </Sidebar>
    );
}

export { DashboardSidebar };
