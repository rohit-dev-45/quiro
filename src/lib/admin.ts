import {
    ADMIN_LOGS_ROUTE,
    ADMIN_ROUTE,
    ADMIN_SECURITY_ROUTE,
    ADMIN_USERS_ROUTE,
} from "@/lib/dashboard-nav";
import type { PlanId } from "@/lib/billing";

export {
    ADMIN_LOGS_ROUTE,
    ADMIN_ROUTE,
    ADMIN_SECURITY_ROUTE,
    ADMIN_USERS_ROUTE,
};

export const ADMIN_ROLE = "admin";

export const ADMIN_BADGE = "Admin only";

export function isAdminRoute(pathname: string) {
    return pathname === ADMIN_ROUTE || pathname.startsWith(`${ADMIN_ROUTE}/`);
}

export function isAdminRole(role: string | null | undefined) {
    return role === ADMIN_ROLE;
}

export type AdminTab = {
    href: string;
    label: string;
    ready: boolean;
};

export const ADMIN_TABS: AdminTab[] = [
    { href: ADMIN_ROUTE, label: "Overview", ready: true },
    { href: ADMIN_USERS_ROUTE, label: "Users", ready: true },
    { href: `${ADMIN_USERS_ROUTE}/new`, label: "Add User", ready: true },
    { href: ADMIN_SECURITY_ROUTE, label: "Security", ready: true },
    { href: ADMIN_LOGS_ROUTE, label: "Logs", ready: true },
];

export const ADMIN_TOP_USERS = 3;

export const ADMIN_ACTIVE_WINDOW_DAYS = 30;

export type AdminActiveUser = {
    id: string;
    name: string;
    email: string;
    image: string | null;
    questions: number;
};

export type AdminOverview = {
    documentsIndexed: number;
    questionsThisMonth: number;
    activeUsers: number;
    paidSubscribers: number;
    totalUsers: number;
    mostActive: AdminActiveUser[];
};

export function formatCount(value: number) {
    return value.toLocaleString("en-US");
}

export const ADMIN_USERS_PAGE_SIZE = 6;

export const ADMIN_QUERY_MAX = 100;

export function adminUsersHref({
    query = "",
    page = 1,
}: { query?: string; page?: number } = {}) {
    const params = new URLSearchParams();

    if (query) params.set("q", query);
    if (page > 1) params.set("page", String(page));

    const search = params.toString();

    return search ? `${ADMIN_USERS_ROUTE}?${search}` : ADMIN_USERS_ROUTE;
}

export type AdminUserStatus = "active" | "inactive" | "deactivated";

export type AdminUserRow = {
    id: string;
    name: string;
    email: string;
    image: string | null;
    planId: PlanId;
    status: AdminUserStatus;
    lastActive: string | null;
    isAdmin: boolean;
};

export type AdminUsersView = {
    users: AdminUserRow[];
    total: number;
    page: number;
    pageCount: number;
};

export function lastActiveLabel(
    iso: string | null,
    now: Date = new Date(),
): string {
    if (!iso) return "Never";

    const seconds = Math.max(
        0,
        (now.getTime() - new Date(iso).getTime()) / 1000,
    );
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${Math.floor(minutes)}m ago`;
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    if (days < 90) return `${Math.floor(days)}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;

    return `${Math.floor(days / 365)}y ago`;
}

export const MIN_CREATED_PASSWORD_LENGTH = 8;

const PASSWORD_ALPHABET =
    "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const GENERATED_PASSWORD_LENGTH = 16;

export function generatedPassword() {
    const bytes = crypto.getRandomValues(
        new Uint32Array(GENERATED_PASSWORD_LENGTH),
    );

    return Array.from(
        bytes,
        (byte) => PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length],
    ).join("");
}

export type AccountTypeOption = {
    planId: PlanId;
    name: string;
    detail: string;
};

export const ACCOUNT_TYPES: AccountTypeOption[] = [
    { planId: "free", name: "Free", detail: "5 Questions/Mo" },
    { planId: "pro", name: "Pro", detail: "50 Questions/Mo" },
    { planId: "business", name: "Business", detail: "Unlimited" },
];
