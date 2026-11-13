import {
    ADMIN_LOG_PAGE_SIZE,
    SYSTEM_ACTOR,
    type AdminLogEntry,
    type LogAction,
} from "@/lib/admin-log";
import { db } from "@/lib/db";

export async function recordAdminLog({
    action,
    description,
    actorId,
    actorName,
    targetId,
}: {
    action: LogAction;
    description: string;
    actorId?: string | null;
    actorName?: string | null;
    targetId?: string | null;
}) {
    try {
        await db.adminLog.create({
            data: {
                action,
                description,
                actorId: actorId ?? null,
                actorName: actorName ?? null,
                targetId: targetId ?? null,
            },
        });
    } catch (error) {
        console.error("[admin-log] Could Not Record", action, error);
    }
}

export async function actorNameFor(userId: string) {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
    });

    return user?.name || user?.email || null;
}

function toEntry(row: {
    id: string;
    actorName: string | null;
    action: string;
    description: string;
    createdAt: Date;
}): AdminLogEntry {
    return {
        id: row.id,
        actor: row.actorName ?? SYSTEM_ACTOR,
        action: row.action,
        description: row.description,
        createdAt: row.createdAt.toISOString(),
    };
}

export async function listAdminLog(
    limit = ADMIN_LOG_PAGE_SIZE,
): Promise<AdminLogEntry[]> {
    const rows = await db.adminLog.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
    });

    return rows.map(toEntry);
}

export async function listAdminLogForExport(): Promise<AdminLogEntry[]> {
    const rows = await db.adminLog.findMany({ orderBy: { createdAt: "desc" } });

    return rows.map(toEntry);
}

function csvCell(value: string) {
    return `"${value.replace(/"/g, '""')}"`;
}

export function adminLogToCsv(entries: AdminLogEntry[]) {
    const header = ["Timestamp", "Actor", "Action", "Description"];

    const rows = entries.map((entry) =>
        [entry.createdAt, entry.actor, entry.action, entry.description]
            .map(csvCell)
            .join(","),
    );

    return [header.map(csvCell).join(","), ...rows].join("\r\n");
}
