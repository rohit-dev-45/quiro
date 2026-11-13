import {
    ChartLineIcon,
    HouseIcon,
    LibraryIcon,
    MessageSquareIcon,
    SearchIcon,
    SettingsIcon,
    ShieldIcon,
    type LucideIcon,
} from "lucide-react";

export const APP_ROOT = "/app";

export const ONBOARDING_ROUTE = `${APP_ROOT}/onboarding`;

export const SETTINGS_ROUTE = `${APP_ROOT}/settings`;
export const BILLING_ROUTE = `${SETTINGS_ROUTE}/billing`;
export const DANGER_ZONE_ROUTE = `${SETTINGS_ROUTE}/danger-zone`;

export const ADMIN_ROUTE = `${APP_ROOT}/admin`;
export const ADMIN_USERS_ROUTE = `${ADMIN_ROUTE}/users`;
export const ADMIN_SECURITY_ROUTE = `${ADMIN_ROUTE}/security`;
export const ADMIN_LOGS_ROUTE = `${ADMIN_ROUTE}/logs`;

export type DashboardNavSubItem = {
    href: string;
    label: string;
};

export type DashboardNavCount = "chats" | "documents";

export type DashboardNavCounts = Record<DashboardNavCount, number>;

export type DashboardNavItem = {
    href: string;
    label: string;
    icon: LucideIcon;
    count?: DashboardNavCount;
    tag?: string;
    adminOnly?: boolean;
    items?: DashboardNavSubItem[];
};

export type DashboardNavGroup = {
    title?: string;
    items: DashboardNavItem[];
};

export const dashboardNav: DashboardNavGroup[] = [
    {
        items: [
            { href: APP_ROOT, label: "Home", icon: HouseIcon },
            {
                href: `${APP_ROOT}/chats`,
                label: "Chats",
                icon: MessageSquareIcon,
                count: "chats",
            },
            {
                href: `${APP_ROOT}/library`,
                label: "Library",
                icon: LibraryIcon,
                count: "documents",
            },
            { href: `${APP_ROOT}/search`, label: "Search", icon: SearchIcon },
        ],
    },
    {
        title: "Manage",
        items: [
            { href: `${APP_ROOT}/usage`, label: "Usage", icon: ChartLineIcon },
            {
                href: SETTINGS_ROUTE,
                label: "Settings",
                icon: SettingsIcon,
                items: [
                    { href: SETTINGS_ROUTE, label: "Account" },
                    { href: BILLING_ROUTE, label: "Billing" },
                ],
            },
            {
                href: ADMIN_ROUTE,
                label: "Admin",
                icon: ShieldIcon,
                tag: "Owner",
                adminOnly: true,
                items: [
                    { href: ADMIN_ROUTE, label: "Overview" },
                    { href: ADMIN_USERS_ROUTE, label: "Users" },
                    { href: ADMIN_SECURITY_ROUTE, label: "Security" },
                    { href: ADMIN_LOGS_ROUTE, label: "Logs" },
                ],
            },
        ],
    },
];

const navItems = dashboardNav.flatMap((group) => group.items);

export function visibleDashboardNav(isAdmin: boolean) {
    if (isAdmin) return dashboardNav;

    return dashboardNav
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => !item.adminOnly),
        }))
        .filter((group) => group.items.length > 0);
}

export function isDashboardNavItemActive(
    item: DashboardNavItem,
    pathname: string,
) {
    return item.href === APP_ROOT
        ? pathname === APP_ROOT
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function dashboardPageTitle(pathname: string) {
    const match = [...navItems]
        .sort((a, b) => b.href.length - a.href.length)
        .find((item) => isDashboardNavItemActive(item, pathname));

    return match?.label ?? "Home";
}

export function workspaceInitials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join("");
}
