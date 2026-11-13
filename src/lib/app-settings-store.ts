import { cache } from "react";

import { describeChatsPurged, LOG_ACTIONS } from "@/lib/admin-log";
import { recordAdminLog } from "@/lib/admin-log-store";
import { DEFAULT_APP_SETTINGS, type AppSettings } from "@/lib/app-settings";
import { db } from "@/lib/db";

const SETTINGS_ID = "app";

export const getAppSettings = cache(async (): Promise<AppSettings> => {
    try {
        const row = await db.appSetting.findUnique({
            where: { id: SETTINGS_ID },
        });

        if (!row) return DEFAULT_APP_SETTINGS;

        return {
            allowSignUps: row.allowSignUps,
            enforceTwoFactor: row.enforceTwoFactor,
            maintenanceMode: row.maintenanceMode,
            chatRetentionMonths: row.chatRetentionMonths,
        };
    } catch (error) {
        console.error("[settings] Falling Back To Defaults", error);

        return DEFAULT_APP_SETTINGS;
    }
});

export async function updateAppSettings(
    patch: Partial<AppSettings>,
    updatedByUserId: string,
) {
    const row = await db.appSetting.upsert({
        where: { id: SETTINGS_ID },
        create: {
            id: SETTINGS_ID,
            ...DEFAULT_APP_SETTINGS,
            ...patch,
            updatedByUserId,
        },
        update: { ...patch, updatedByUserId },
    });

    return {
        allowSignUps: row.allowSignUps,
        enforceTwoFactor: row.enforceTwoFactor,
        maintenanceMode: row.maintenanceMode,
        chatRetentionMonths: row.chatRetentionMonths,
    };
}

export async function purgeExpiredChats(now: Date = new Date()) {
    const { chatRetentionMonths } = await getAppSettings();

    if (chatRetentionMonths === null) return { deleted: 0, cutoff: null };

    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - chatRetentionMonths);

    const { count } = await db.chat.deleteMany({
        where: { updatedAt: { lt: cutoff } },
    });

    if (count > 0) {
        await recordAdminLog({
            action: LOG_ACTIONS.chatsPurged,
            description: describeChatsPurged(count, chatRetentionMonths),
        });
    }

    return { deleted: count, cutoff: cutoff.toISOString() };
}
