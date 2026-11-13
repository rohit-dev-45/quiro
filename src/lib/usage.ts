import { APP_ROOT } from "@/lib/dashboard-nav";

export const USAGE_ROUTE = `${APP_ROOT}/usage`;

export const USAGE_CHART_DAYS = 14;

export const USAGE_TOP_DOCUMENTS = 5;

export type UsagePeriod = {
    start: string;
    end: string;
    resetsInDays: number;
};

export function usagePeriod(now: Date = new Date()): UsagePeriod {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const end = new Date(nextStart.getTime() - 1);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const resetsInDays = Math.round(
        (nextStart.getTime() - today.getTime()) / 86_400_000,
    );

    return {
        start: start.toISOString(),
        end: end.toISOString(),
        resetsInDays,
    };
}

export function formatPeriod(period: UsagePeriod) {
    const start = new Date(period.start);
    const end = new Date(period.end);
    const day = (date: Date) =>
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return `${day(start)} – ${day(end)}, ${end.getFullYear()}`;
}

export function formatDuration(seconds: number) {
    if (seconds < 10) return `${seconds.toFixed(1)}s`;
    if (seconds < 60) return `${Math.round(seconds)}s`;

    const minutes = Math.floor(seconds / 60);

    return `${minutes}m ${String(Math.round(seconds % 60)).padStart(2, "0")}s`;
}

export type UsageDay = {
    date: string;
    questions: number;
};

export type UsageDocument = {
    id: string;
    name: string;
    questions: number;
};

export type UsageView = {
    period: UsagePeriod;
    questions: number;
    questionLimit: number;
    documentsIndexed: number;
    citations: number;
    averageAnswerSeconds: number | null;
    days: UsageDay[];
    documents: UsageDocument[];
};
