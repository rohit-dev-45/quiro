import type { DocumentStatusView, LibraryDocumentView } from "@/lib/chat";
import { APP_ROOT } from "@/lib/dashboard-nav";

export const LIBRARY_ROUTE = `${APP_ROOT}/library`;

export const LIBRARY_PAGE_SIZE = 6;

export const LIBRARY_QUERY_MAX = 100;

export type LibraryStatusFilter = "all" | "indexed" | "indexing" | "failed";

export const libraryStatusFilters: {
    value: LibraryStatusFilter;
    label: string;
    status: DocumentStatusView | null;
}[] = [
    { value: "all", label: "All", status: null },
    { value: "indexed", label: "Indexed", status: "READY" },
    { value: "indexing", label: "Indexing", status: "PROCESSING" },
    { value: "failed", label: "Failed", status: "FAILED" },
];

export function toLibraryStatusFilter(value?: string): LibraryStatusFilter {
    return libraryStatusFilters.some((filter) => filter.value === value)
        ? (value as LibraryStatusFilter)
        : "all";
}

export function libraryHref({
    status = "all",
    query = "",
    page = 1,
}: {
    status?: LibraryStatusFilter;
    query?: string;
    page?: number;
} = {}) {
    const params = new URLSearchParams();

    if (status !== "all") params.set("status", status);
    if (query.trim()) params.set("q", query.trim());
    if (page > 1) params.set("page", String(page));

    const search = params.toString();

    return search ? `${LIBRARY_ROUTE}?${search}` : LIBRARY_ROUTE;
}

export function shortAge(date: Date, now: Date = new Date()) {
    const seconds = Math.max(0, (now.getTime() - date.getTime()) / 1000);
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${Math.floor(minutes)}m ago`;
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    if (days < 7) return `${Math.floor(days)}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;

    return `${Math.floor(days / 365)}y ago`;
}

export type LibraryRowView = LibraryDocumentView & {
    createdAt: string;
    chatCount: number;
};

export type LibraryCountsView = {
    libraryTotal: number;
    counts: Record<LibraryStatusFilter, number>;
};

export type LibraryRowsView = {
    documents: LibraryRowView[];
    total: number;
    page: number;
    pageCount: number;
};
